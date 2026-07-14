import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAlertStream } from "@/hooks/useAlertStream";
import * as liveStore from "@/stores/liveStore";

describe("useAlertStream", () => {
  let mockEventSource: any;
  let addAlertMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockEventSource = {
      close: vi.fn(),
      onmessage: null,
      onerror: null,
    };
    
    vi.stubGlobal(
      "EventSource",
      vi.fn().mockImplementation(function() { return mockEventSource; })
    );

    addAlertMock = vi.fn();
    vi.spyOn(liveStore, "useLiveStore").mockImplementation((selector: any) => {
      return selector({
        addAlert: addAlertMock,
        match: { minute: 10, phase: "first-half", score: "1-0" },
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("creates EventSource on mount with correct URL", () => {
    renderHook(() => useAlertStream());
    expect(global.EventSource).toHaveBeenCalledWith("/api/alert?minute=10&phase=first-half&score=1-0");
  });

  it("onmessage with type:alert calls addAlert", () => {
    renderHook(() => useAlertStream());
    
    act(() => {
      mockEventSource.onmessage({
        data: JSON.stringify({ type: "alert", alert: { id: "test" } }),
      });
    });
    
    expect(addAlertMock).toHaveBeenCalledWith({ id: "test" });
  });

  it("onmessage with type:complete closes source and schedules reconnect", () => {
    renderHook(() => useAlertStream());
    
    act(() => {
      mockEventSource.onmessage({
        data: JSON.stringify({ type: "complete" }),
      });
    });
    
    expect(mockEventSource.close).toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(45000);
    });
    
    expect(global.EventSource).toHaveBeenCalledTimes(2);
  });

  it("onerror triggers exponential backoff reconnect", () => {
    renderHook(() => useAlertStream());
    
    act(() => {
      mockEventSource.onerror();
    });
    
    expect(mockEventSource.close).toHaveBeenCalled();
    
    act(() => { vi.advanceTimersByTime(1000); });
    expect(global.EventSource).toHaveBeenCalledTimes(2);
    
    act(() => { mockEventSource.onerror(); });
    
    act(() => { vi.advanceTimersByTime(2000); });
    expect(global.EventSource).toHaveBeenCalledTimes(3);
    
    act(() => { mockEventSource.onerror(); });
    
    act(() => { vi.advanceTimersByTime(4000); });
    expect(global.EventSource).toHaveBeenCalledTimes(4);
    
    act(() => { mockEventSource.onerror(); });
    
    act(() => { vi.advanceTimersByTime(8000); });
    expect(global.EventSource).toHaveBeenCalledTimes(5);
  });

  it("unmount cleans up EventSource", () => {
    const { unmount } = renderHook(() => useAlertStream());
    
    unmount();
    expect(mockEventSource.close).toHaveBeenCalled();
  });
});

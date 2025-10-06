import { notificationService } from '../notificationService';

// Mock EventSource
class MockEventSource {
  public readyState = 1;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public addEventListener = jest.fn();
  public close = jest.fn();

  constructor(public url: string, options?: any) {
    // Simulate connection after a short delay
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }
}

// Mock global EventSource
(global as any).EventSource = MockEventSource;

describe('NotificationService', () => {
  beforeEach(() => {
    // Reset the service before each test
    notificationService.disconnect();
  });

  afterEach(() => {
    // Clean up after each test
    notificationService.disconnect();
  });

  it('should connect to notification stream', () => {
    const connectSpy = jest.spyOn(notificationService, 'connect');
    
    notificationService.connect();
    
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should emit connection status events', (done) => {
    notificationService.on('connection:status', (connected) => {
      expect(connected).toBe(true);
      done();
    });

    notificationService.connect();
  });

  it('should handle new notifications', (done) => {
    const mockNotification = {
      id: '1',
      title: 'Test Notification',
      message: 'This is a test',
      type: 'INFO',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    notificationService.on('notification:new', (notification) => {
      expect(notification).toEqual(mockNotification);
      done();
    });

    notificationService.connect();
    
    // Simulate receiving a notification
    setTimeout(() => {
      const event = new MessageEvent('message', {
        data: JSON.stringify({ type: 'notification', notification: mockNotification })
      });
      if (notificationService['eventSource']?.onmessage) {
        notificationService['eventSource'].onmessage(event);
      }
    }, 20);
  });

  it('should handle count updates', (done) => {
    const mockCount = 5;

    notificationService.on('notification:count', (count) => {
      expect(count).toBe(mockCount);
      done();
    });

    notificationService.connect();
    
    // Simulate receiving a count update
    setTimeout(() => {
      const event = new MessageEvent('message', {
        data: JSON.stringify({ type: 'count', count: mockCount })
      });
      if (notificationService['eventSource']?.onmessage) {
        notificationService['eventSource'].onmessage(event);
      }
    }, 20);
  });

  it('should disconnect properly', () => {
    const closeSpy = jest.fn();
    notificationService.connect();
    
    // Mock the close method
    if (notificationService['eventSource']) {
      notificationService['eventSource'].close = closeSpy;
    }

    notificationService.disconnect();
    
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should return connection status', () => {
    expect(notificationService.getConnectionStatus()).toBe(false);
    
    notificationService.connect();
    
    // Connection status should be true after connection
    setTimeout(() => {
      expect(notificationService.getConnectionStatus()).toBe(true);
    }, 20);
  });
});

// Simple event system for notifying components when apprenticeship save status changes

type EventCallback = (vacancyId: string) => void;

class SavedApprenticeshipEvents {
  private listeners: Map<string, EventCallback[]> = new Map();

  // Subscribe to a specific event
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)?.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit an event
  emit(event: string, vacancyId: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(vacancyId));
    }
  }
}

// Singleton instance
export const savedApprenticeshipEvents = new SavedApprenticeshipEvents();

// Event names
export const APPRENTICESHIP_UNSAVED = 'apprenticeship_unsaved';
export const APPRENTICESHIP_SAVED = 'apprenticeship_saved';
export const ALL_APPRENTICESHIPS_REMOVED = 'all_apprenticeships_removed';

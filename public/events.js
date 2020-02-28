
class Event {
    target;
    params = [];

    static pointer = -1;
    static history = [];

    constructor(target, ...params) {
        this.target = target;
        this.params = params;
        this.constructor.add( this );
        this.constructor.proceed();
    }

    /**
     * Applies changes for this event.
     */
    up() {}

    /**
     * Reverses changes for this event.
     */
    down() {}

    /**
     * Adds an event to the event history.
     */
    static add( event ) {
        Event.history.length = this.pointer + 1;
        Event.history.push( event );
    }

    /**
     * Executes the next event in the event history.
     */
    static proceed() {
        setTimeout(() => {
            const nextEvent = Event.history[ this.pointer + 1 ];
            if (!nextEvent) return;
            nextEvent.up( nextEvent.target, ...nextEvent.params );
            Event.pointer++;
        }, 0);
    }

    /**
     * Reverses changes made by the last event.
     */
    static rollback() {
        const lastEvent = Event.history[ this.pointer ];
        if (!lastEvent) return;
        lastEvent.down( lastEvent.target, ...lastEvent.params );
        Event.pointer--;
    }
}

class TodoEvent extends Event {
    todo = new Todo();
}

class AddTodo extends TodoEvent {

    /**
     * Adds the todo item to the note.
     * @constructor
     * @param {Note} note - The note for the todo item.
     */
    up( note ) { note.todo.push( this.todo ); }

    /**
     * Deletes the todo item from the note.
     * @constructor
     * @param {Note} note - The note for the todo item.
     */
    down( note ) { note.todo.pop(); }
}

class DeleteTodo extends TodoEvent {
    oldTodoList;

    /**
     * Deletes the todo item from the note.
     * @constructor
     * @param {Note} note - The note for the todo item.
     * @param {number} todoIdx - The index of the todo item.
     */
    up( note, todoIdx ) {
        this.oldTodoList = [].concat(note.todo);
        note.todo.splice(todoIdx, 1);
    }

    /**
     * Adds the todo item to the note.
     * @constructor
     * @param {Note} note - The note for the todo item.
     */
    down( note ) { note.todo = this.oldTodoList; }
}

class CheckTodo extends Event {

    /**
     * Toggles the isChecked value of the todo item.
     * @constructor
     * @param {Todo} todo - The todo item.
     */
    toggleCheck( todo ) { todo.isChecked = !todo.isChecked; }

    /**
     * Toggles the isChecked value to the new one.
     * @constructor
     * @param {Todo} todo - The todo item.
     */
    up( todo ) { this.toggleCheck( todo ); }

    /**
     * Toggles the isChecked value to the old one.
     * @constructor
     * @param {Todo} todo - The todo item.
     */
    down( todo ) { this.toggleCheck( todo ); }
}

class ChangeTodoText extends Event {

    /**
     * Assigns the new value to the todo item text.
     * @constructor
     * @param {Todo} todo - The todo item.
     * @param {string} newValue - The new text of the todo item.
     */
    up( todo, newValue ) { todo.text = newValue; }

    /**
     * Assigns the old value to the todo item text.
     * @constructor
     * @param {Todo} todo - The todo item.
     * @param {string} newValue - The new text of the todo item.
     * @param {string} oldValue - The old text of the todo item.
     */
    down( todo, newValue, oldValue ) { todo.text = oldValue; }
}

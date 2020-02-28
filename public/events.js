
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

    up() {}

    down() {}

    static add( event ) {
        Event.history.length = this.pointer + 1;
        Event.history.push( event );
    }

    static proceed() {
        setTimeout(() => {
            const nextEvent = Event.history[ this.pointer + 1 ];
            if (!nextEvent) return;
            nextEvent.up( nextEvent.target, ...nextEvent.params );
            Event.pointer++;
        }, 0);
    }

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

    up( note ) { note.todo.push( this.todo ); }

    down( note ) { note.todo.pop(); }
}

class DeleteTodo extends TodoEvent {
    oldTodoList;

    up( note, todoIdx ) {
        this.oldTodoList = [].concat(note.todo);
        note.todo.splice(todoIdx, 1);
    }

    down( note ) { note.todo = this.oldTodoList; }
}

class CheckTodo extends Event {

    toggleCheck( todo ) { todo.isChecked = !todo.isChecked; }

    up( todo ) { this.toggleCheck( todo ); }

    down( todo ) { this.toggleCheck( todo ); }
}

class ChangeTodoText extends Event {

    up( todo, newValue ) { todo.text = newValue; }

    down( todo, newValue, oldValue ) { todo.text = oldValue; }
}

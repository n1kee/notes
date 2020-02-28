(function() {

    class Note {
        id;
        name;
        todo = [];
    }

    class Todo {
        text;
        isChecked = false;
    }

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

    class SaveNote extends Event {
        up() { }

        down() { }
    }

    Vue.component('note-view', {
        props: ['note'],
        template: `
            <div>
                <div>{{ note.name }}</div>
                <div>
                    <ul>
                        <li v-for="todo in note.todo.slice(0, 2)">
                            <input v-model="todo.isChecked" type="checkbox" disabled >
                            {{ todo.text }}
                        </li>
                    </ul>
                    <button @click="$emit('edit')">EDIT</button>
                    <button @click="$emit('delete')">DELETE</button>
                </div>
            </div>
          `
        });


    Vue.component('note-edit', {
        props: ['note'],
        data: function () {
            return {
                events: Event
            };
        },
        methods: {
            undo: function () { this.events.rollback(); },
            redo: function () { this.events.proceed(); },
            addTodo: function () { new AddTodo( this.note ) },
            deleteTodo: function ( todoIdx ) { new DeleteTodo( this.note, todoIdx ) },
            checkTodo: function ( todo ) {  new CheckTodo( todo ); },
            changeTodoText: function ( todo, event ) {
                new ChangeTodoText( todo, event.target.value, todo.text );
            },
            cancel: function () {  this.$emit('cancel-edit'); },

            saveNote: function () {
                this.note.id ? this.updateNote(this.note) : this.createNote(this.note);;
            },
            createNote: function () {
                axios.post('/notes', this.note).then(() => this.cancel());
            },
            updateNote: function () {
                axios.put('/notes/' + this.note.id, this.note).then(() => this.cancel());
            },
            deleteNote: function () {
                axios.delete('/notes/' + this.note.id).then(() => this.cancel());
            },
        },
        template: `
            <div>
                <div>{{ note.name }}</div>
                <div>
                    <ul>
                        <li v-for="( todo, todoIdx ) in note.todo">
                            <input :checked="todo.isChecked" @change="checkTodo( todo )" type="checkbox" >
                            <input :value="todo.text" @change="changeTodoText( todo, $event )">
                            <button @click="deleteTodo( note, todoIdx )">DELETE</button>
                        </li>
                        <li><button @click="addTodo( note )">ADD</button></li>
                    </ul>
                    <div>
                        <div>
                            <button @click="undo()">UNDO</button>
                            <button @click="redo()">REDO</button>
                        </div>
                        <div>
                        
                        </div>
                        <button @click="saveNote( note )">SAVE</button>
                        <button @click="deleteNote( note )">DELETE</button>
                        <button @click="cancel()">CANCEL</button>
                    </div>
                </div>
            </div>
          `
    })

    const app = new Vue({
        el: '#app',
        data: {
            notes: null,
            editingNote: null,
            message: 'Hello Vue!'
        },
        methods: {
            editNote: function () { this.editingNote = new Note(); },
            deleteNote: function ( note ) { axios.delete('/notes/' + note.id).then(() => this.reloadNotes()) },
            reloadNotes: function () { axios.get('/notes').then(response => this.notes = response.data); },
            cancelNoteEdit: function () {
                this.editingNote = null;
                this.reloadNotes();
            },
        },
        mounted: function () { this.reloadNotes(); },
    })
})();
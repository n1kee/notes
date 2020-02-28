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


    Vue.component('note-view', {
        props: ['note'],
        template: `
            <div class="note-view">
                <div>
                    <span class="note-view__name">{{ note.name }}</span>
                    <div class="float-right">
                        <button @click="$emit('edit')">
                            <span class="glyphicon glyphicon-pencil" title="Edit" aria-hidden="true"></span>
                        </button>
                        <button @click="$emit('delete')">
                            <span class="glyphicon glyphicon-trash" title="Delete" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
                <div>
                    <ul class="note-view__todo-list">
                        <li class="note-view__todo" v-for="todo in note.todo.slice(0, 2)">
                            <input class="note-view__todo-cb" v-model="todo.isChecked" type="checkbox" disabled >
                            <span class="note-view__todo-text">{{ todo.text }}</span>
                        </li>
                    </ul>
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
            <div class="note-edit">
                <h1>Edit note</h1>
                <div class="note-edit__group">
                    <div class="note-edit__header">Name:</div>
                    <div><input v-model="note.name"></div>
                </div>
                <div class="note-edit__group">
                    <div class="note-edit__header">ToDo:</div>
                    <table class="note-edit__todo-list">
                        <tr v-for="( todo, todoIdx ) in note.todo">
                            <td><input class="note-edit__todo-cb" :checked="todo.isChecked" @change="checkTodo( todo )" type="checkbox" ></td>
                            <td class="w-100"><textarea :value="todo.text" @change="changeTodoText( todo, $event )"></textarea></td>
                            <td>
                                <div class="btn-group">
                                    <button @click="deleteTodo( todoIdx )" title="Delete">
                                        <span class="glyphicon glyphicon-trash" title="Delete" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
                <div>
                    <div>
                        <div class="btn-group">
                            <button @click="saveNote()" title="Save">
                                <span class="glyphicon glyphicon-ok" title="Save" aria-hidden="true"></span>
                            </button>
                            <button @click="cancel()" title="Cancel">
                                <span class="glyphicon glyphicon-remove" title="Cancel" aria-hidden="true"></span>
                            </button>
                        </div>
                        <div class="btn-group">
                            <button @click="deleteNote()" title="Delete">
                                <span class="glyphicon glyphicon-trash" title="Delete" aria-hidden="true"></span>
                            </button>
                        </div>
                        <div class="btn-group">
                            <button @click="addTodo()" title="Add ToDo">
                                <span class="glyphicon glyphicon-plus" title="Add" aria-hidden="true"></span>
                                <span></span>
                                Add todo
                            </button>
                        </div>
                        <div class="btn-group float-right">
                            <button @click="undo()"  title="Undo">
                                <span class="glyphicon glyphicon-chevron-left" title="Undo" aria-hidden="true"></span>
                             </button>
                            <button @click="redo()"  title="Redo">
                                <span class="glyphicon glyphicon-chevron-right" title="Redo" aria-hidden="true"></span>
                            </button>
                        </div>
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
        },
        methods: {
            editNewNote: function () { this.editingNote = new Note(); },
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
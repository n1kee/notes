
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
                                <span>Add todo</span>
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
});

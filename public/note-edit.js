
Vue.component('note-edit', {
    props: ['note'],
    data: function () {
        return {
            dialog: new DialogBox(),
            events: Event
        };
    },
    methods: {
        /**
         * Reverses the changes made by the last event.
         */
        undo: function () { this.events.rollback(); },
        /**
         * Remakes the changes made by the last event.
         */
        redo: function () { this.events.proceed(); },
        /**
         * Adds a todo item.
         */
        addTodo: function () { new AddTodo( this.note ) },
        /**
         * Deletes a todo item.
         */
        deleteTodo: function ( todoIdx ) { new DeleteTodo( this.note, todoIdx ) },
        /**
         * Toggles the todo item's isChecked value.
         */
        checkTodo: function ( todo ) {  new CheckTodo( todo ); },
        /**
         * Changes the todo item's text value.
         * @constructor
         * @param {Todo} todo - The todo item.
         * @param {KeyboardEvent} event - The change event of the text.
         */
        changeTodoText: function ( todo, event ) {
            new ChangeTodoText( todo, event.target.value, todo.text );
        },
        /**
         * Emits the cancellation event for the edit.
         */
        cancel: function () {  this.$emit('cancel-edit'); },

        /**
         * Saves the note.
         */
        saveNote: function () {
            this.note.id ? this.updateNote(this.note) : this.createNote(this.note);;
        },
        /**
         * Creates the note.
         */
        createNote: function () {
            axios.post('/notes', this.note).then(() => this.cancel());
        },
        /**
         * Updates the note.
         */
        updateNote: function () {
            axios.put('/notes/' + this.note.id, this.note).then(() => this.cancel());
        },
        /**
         * Deletes the note.
         */
        deleteNote: function () {
            axios.delete('/notes/' + this.note.id).then(() => this.cancel());
        },
        /**
         * Show the deletion dialog.
         */
        showDeletionDialog: function () {
            this.dialog.action = () => this.deleteNote();
        },
        /**
         * Show the cancellation dialog.
         */
        showCancellationDialog: function () {
            this.dialog.action = () => this.cancel();
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
                    <div class="btn-group">
                        <button @click="saveNote()" title="Save">
                            <span class="glyphicon glyphicon-ok" title="Save" aria-hidden="true"></span>
                        </button>
                        <button @click="showCancellationDialog()" title="Cancel">
                            <span class="glyphicon glyphicon-remove" title="Cancel" aria-hidden="true"></span>
                        </button>
                    </div>
                    <div v-if="note.id" class="btn-group">
                        <button @click="showDeletionDialog()" title="Delete">
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
                <dialog-box
                    v-if="dialog.action"
                    v-bind:text="dialog.text"
                    @approve="dialog.approve()"
                    @cancel="dialog.cancel()"
                ></dialog-box>
            </div>
          `
});

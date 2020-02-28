
window.onload = function() {

    class Note {
        id;
        name;
        todo = [];
    }

    const app = new Vue({
        el: '#app',
        data: {
            dialog: new DialogBox(),
            notes: null,
            editingNote: null,
        },
        methods: {
            /**
             * Shows the edit form for a new note.
             */
            editNewNote: function () { this.editingNote = new Note(); },
            /**
             * Sends request to delete the note and reloads the list.
             * @constructor
             * @param {Note} note - The note to be deleted.
             */
            deleteNote: function ( note ) { axios.delete('/notes/' + note.id).then(() => this.reloadNotes()) },
            /**
             * Reloads the note list.
             */
            reloadNotes: function () { axios.get('/notes').then(response => this.notes = response.data); },
            /**
             * Hides the edit form for a new note and reloads the list.
             */
            cancelNoteEdit: function () {
                this.editingNote = null;
                this.reloadNotes();
            },
            /**
             * Shows the dialog for the deletion.
             * @constructor
             * @param {Note} note - The note to be deleted.
             */
            showDeletionDialog: function ( note ) {
                this.dialog.action = () => this.deleteNote( note );
            },
        },
        mounted: function () { this.reloadNotes(); },
    })
};


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
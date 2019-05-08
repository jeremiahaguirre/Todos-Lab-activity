import React, { Component } from "react";
import "./styles.css";
import ToDo from "../ui/components/ToDoItem";
import ToDoCount from "../ui/components/TodoCount";
import ClearButton from "../ui/components/ClearButton";
import Form from "../ui/components/ToDoInput";
import { withTracker } from "meteor/react-meteor-data";
import { ToDos } from "../api/todo";
import AccountsUIWrapper from "../ui/components/AccountsWrapper";
import { Meteor } from "meteor/meteor";

//presentaion component
const Header = props => <h1>{props.children}</h1>;

//class component
class App extends Component {
  constructor(props) {
    super(props);
  }

  toggleComplete = (id, complete) => {
    ToDos.update(id, { $set: { complete: !complete } });
  };

  removeToDo = id => {
    ToDos.remove(id);
  };

  removeCompleted = () => {
    const todosCompleted = this.props.todos
      .filter(todo => todo.complete)
      .map(t => t._id);
    todosCompleted.forEach(id => ToDos.remove(id));
  };

  hasCompleted = () => {
    const todosCompleted = this.props.todos.filter(todo => todo.complete);
    return todosCompleted.length;
  };

  addToDo = (doInput, event) => {
    event.preventDefault();
    const currentUser = this.props.currentUserId;
    const toDoInput = doInput.current;
    if (toDoInput.value) {
      ToDos.insert({
        title: toDoInput.value,
        complete: false,
        owner: currentUser
      });
    }
  };

  static defaultProps = { todos: [] };

  render() {
    const { todos, currentUser } = this.props;
    console.log("From ToDosDB");
    console.table(this.props.todos);
    console.log(this.props.currentUser);
    console.log(this.props.currentUserId);

    return (
      <div className="app-wrapper">
        <div className="login-wrapper">
          <AccountsUIWrapper />
        </div>
        {currentUser ? (
          <div className="todo-list">
            <Header>ToDo List</Header>
            <Form addToDo={this.addToDo} />

            <ul>
              {todos.length > 0 &&
                todos.map((todo, index) => (
                  <ToDo
                    key={todo._id}
                    todo={todo}
                    toggleComplete={this.toggleComplete}
                    removeToDo={this.removeToDo}
                  />
                ))}
            </ul>

            <div className="todo-admin">
              <ToDoCount number={todos.length} />
              {this.hasCompleted() ? (
                <ClearButton removeCompleted={this.removeCompleted} />
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          <div className="logged-out-message">
            <p>Please sign in to see your todos.</p>
          </div>
        )}
      </div>
    );
  }
}

export default withTracker(() => {
  const currentUserId = Meteor.userId();
  return {
    currentUser: Meteor.user(),
    currentUserId: Meteor.userId(),
    todos: currentUserId ? ToDos.find({ owner: currentUserId }).fetch() : []
  };
})(App);

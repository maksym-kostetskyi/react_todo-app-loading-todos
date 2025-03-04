/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { getTodos } from './api/todos';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [shownTodos, setShownTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [todosFilter, setTodosFilter] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo>();
  const focusedTodoRef = useRef<HTMLInputElement>(null);

  function showError(errMessage: string) {
    if (errMessage) {
      setErrorMessage(errMessage);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  }

  useEffect(() => {
    getTodos()
      .then(todos => {
        setTodosFromServer(todos);
        setShownTodos(todos);
      })
      .catch(error => {
        showError('Unable to load todos');
        throw error;
      });
  }, []);

  useEffect(() => {
    function filterTodos(filter: string) {
      switch (filter) {
        case 'active':
          return todosFromServer.filter(todo => !todo.completed);
        case 'completed':
          return todosFromServer.filter(todo => todo.completed);
        default:
          return todosFromServer;
      }
    }

    setShownTodos(filterTodos(todosFilter));
  }, [todosFilter, todosFromServer]);

  useEffect(() => {
    focusedTodoRef.current?.focus();
  }, [focusedTodoRef, selectedTodo]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {shownTodos.length !== 0 && (
            <div>
              {shownTodos.map(todo => (
                <div
                  data-cy="Todo"
                  className={classNames('todo', {
                    'todo completed': todo.completed,
                  })}
                  key={todo.id}
                >
                  <label className="todo__status-label">
                    <input
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      defaultChecked={todo.completed && true}
                    />
                  </label>

                  {todo !== selectedTodo ? (
                    <>
                      <span
                        data-cy="TodoTitle"
                        className="todo__title"
                        onDoubleClick={() => setSelectedTodo(todo)}
                      >
                        {todo.title}
                      </span>

                      {/* Remove button appears only on hover */}
                      <button
                        type="button"
                        className="todo__remove"
                        data-cy="TodoDelete"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <form>
                      <input
                        data-cy="TodoTitleField"
                        type="text"
                        className="todo__title-field"
                        placeholder="Empty todo will be deleted"
                        value="Todo is being edited now"
                        onBlur={() => setSelectedTodo(undefined)}
                        ref={focusedTodoRef}
                      />
                    </form>
                  )}

                  {/* overlay will cover the todo while it is being deleted or updated */}
                  <div data-cy="TodoLoader" className="modal overlay">
                    <div className="modal-background has-background-white-ter" />
                    <div className="loader" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Hide the footer if there are no todos */}
        {todosFromServer.length !== 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todosFromServer.filter(todo => !todo.completed).length} items
              left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: todosFilter === '',
                })}
                data-cy="FilterLinkAll"
                onClick={() => setTodosFilter('')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: todosFilter === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={() => setTodosFilter('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: todosFilter === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setTodosFilter('completed')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: errorMessage === '' },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {/* show only one message at a time */}
        {errorMessage === 'Unable to load todos' && (
          <>
            Unable to load todos
            <br />
          </>
        )}
        {errorMessage === 'Title should not be empty' && (
          <>
            Title should not be empty
            <br />
          </>
        )}
        {errorMessage === 'Unable to add a todo' && (
          <>
            Unable to add a todo
            <br />
          </>
        )}
        {errorMessage === 'Unable to delete a todo' && (
          <>
            Unable to delete a todo
            <br />
          </>
        )}
        {errorMessage === 'Unable to update a todo' && (
          <>
            Unable to update a todo
            <br />
          </>
        )}
      </div>
    </div>
  );
};

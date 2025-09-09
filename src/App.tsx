/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todoApi';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { ErrorNotification } from './components/ErrorNotification';
import { Status } from './types/Status';
import { ErrorMessage } from './types/ErorrMessage';
import { TodoHeader } from './components/TodoHeader';
import { getCompletedTodos } from './services/todoUtils';
import { NewTodo } from './types/NewTodo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [status, setStatus] = useState<Status>(Status.ALL);

  const [errorMessage, setErrorMessage] = useState<ErrorMessage | ''>('');

  const [loading, setLoading] = useState(false);
  const [loadingTodoId, setLoadingTodoId] = useState<number[]>([]);

  useEffect(() => {
    async function loadTodos() {
      try {
        const newTodos = await todoService.getTodos();

        setTodos(newTodos);
      } catch (error) {
        setErrorMessage(ErrorMessage.LOAD);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        throw error;
      }
    }

    loadTodos();
  }, []);

  async function deleteTodo(todoId: number) {
    try {
      setLoadingTodoId(ids => [...ids, todoId]);
      setLoading(true);
      await todoService.deleteTodo(todoId);
      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId));
    } catch (error) {
      setErrorMessage(ErrorMessage.DELETE);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      throw error;
    } finally {
      setLoading(false);
      setLoadingTodoId([]);
    }
  }

  async function addTodo({ title, userId, completed }: NewTodo) {
    const temp: Todo = { id: 0, title, userId, completed };

    setTempTodo(temp);
    setLoadingTodoId(ids => [...ids, temp.id]);

    try {
      setLoading(true);
      const newTodo = await todoService.createTodo({
        title,
        userId,
        completed,
      });

      setTodos(currentTodos => [...currentTodos, newTodo]);
      setTempTodo(null);
    } catch (error) {
      setErrorMessage(ErrorMessage.ADD);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      throw error;
    } finally {
      setLoading(false);
      setLoadingTodoId([]);
    }
  }

  function deleteComplitedTodos(isPressed: boolean) {
    if (isPressed) {
      const completedTodos = getCompletedTodos(todos);

      completedTodos.forEach(todo => {
        deleteTodo(todo.id);
      });
    }
  }

  const filtredTodos = useMemo(() => {
    let list = todos;

    if (status === 'Active') {
      list = list.filter(todo => !todo.completed);
    } else if (status === 'Completed') {
      list = list.filter(todo => todo.completed);
    }

    return list;
  }, [status, todos]);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader todos={todos} />

        <TodoList
          todos={filtredTodos}
          isLoading={loading}
          loadingTodoId={loadingTodoId}
          onDelete={deleteTodo}
        />

        {!!todos.length && (
          <TodoFooter
            todos={todos}
            status={status}
            onStatusChange={setStatus}
            onClearCompleted={deleteComplitedTodos}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onClearMessage={() => setErrorMessage('')}
      />
    </div>
  );
};

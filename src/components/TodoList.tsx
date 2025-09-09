import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  isLoading: boolean;
  loadingTodoId: number[];
  onDelete: (todoId: number) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  isLoading,
  loadingTodoId,
  onDelete,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isLoading={isLoading}
          loadingTodoId={loadingTodoId}
          onDelete={onDelete}
        />
      ))}

      <TodoItem
        todo={tempTodo}
        isLoading={isLoading}
        loadingTodoId={loadingTodoId}
        onDelete={onDelete}
      />
    </section>
  );
};

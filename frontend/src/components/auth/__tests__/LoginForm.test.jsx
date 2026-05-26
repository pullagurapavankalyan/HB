import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';

describe('LoginForm', () => {
  test('renders register link', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  test('shows validation messages for invalid input', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(button);

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });
});

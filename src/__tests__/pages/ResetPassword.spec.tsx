import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import ResetPassword from '../../pages/ResetPassword';
import api from '../../services/api';

const apiMock = new MockAdapter(api);
const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();
let mockedLocationSearch = 'any-token';

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    useLocation: () => ({
      search: mockedLocationSearch,
    }),
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: jest.fn(),
    }),
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('ResetPassword Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
  });

  it('should be able to reset password', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '1234' } });
    fireEvent.change(passwordConfirmationField, { target: { value: '1234' } });

    apiMock.onPost('password/reset').reply(200, {
      password: '1234',
      password_confirmation: '1234',
      token: mockedLocationSearch,
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
    });
  });

  it('should not be able to reset password with inexistent token', async () => {
    mockedLocationSearch = '';

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '1234' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: '1234' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('should not be able to reset password with invalid password', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '1234' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: 'no-equals-password' },
    });

    apiMock.onPost('password/reset').reply(500);

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' }),
      );
    });
  });
});

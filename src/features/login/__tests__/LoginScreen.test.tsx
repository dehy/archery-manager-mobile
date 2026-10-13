import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

import { ApiError } from '@/api/errors';
import { useSession } from '@/auth/session';

import LoginScreen from '../../../app/(auth)/login';

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => ({})) }));

describe('LoginScreen', () => {
  afterEach(() => jest.restoreAllMocks());

  it('asks for valid credentials before calling the server', async () => {
    const signIn = jest.spyOn(useSession.getState(), 'signIn');
    await render(<LoginScreen />);
    expect(screen.getByText('La vie de votre club, dans votre poche.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() => expect(screen.getByText('Adresse e-mail invalide')).toBeTruthy());
    expect(screen.getByText('Mot de passe requis')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('shows a refused login in the error banner', async () => {
    useSession.setState({
      signIn: jest.fn(async () => {
        throw new ApiError(401, 'invalid_credentials', 'x');
      }),
    });
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByTestId('login-email'), 'lea@example.fr');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'secret');
    await fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByText('Identifiants incorrects.')).toBeTruthy();
  });

  it('reveals the password on demand', async () => {
    await render(<LoginScreen />);
    expect(screen.getByTestId('login-password').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByLabelText('Afficher le mot de passe'));
    expect(screen.getByTestId('login-password').props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Masquer le mot de passe')).toBeTruthy();
  });

  it('opens the reset and sign-up pages of the server', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId('login-forgot'));
    await fireEvent.press(screen.getByTestId('login-register'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'http://localhost:8080/reset-password',
    );
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('http://localhost:8080/register');
  });
});

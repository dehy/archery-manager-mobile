import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { loginErrorMessage } from '@/auth/loginError';
import { useSession } from '@/auth/session';
import { t } from '@/i18n';
import { Button, Screen, Text, TextField } from '@/ui';

const schema = z.object({
  email: z.email(t('login.emailInvalid')),
  password: z.string().min(1, t('login.passwordRequired')),
});
type Values = z.infer<typeof schema>;

export default function LoginScreen() {
  const signIn = useSession((s) => s.signIn);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(loginErrorMessage(e));
    }
  });

  return (
    <Screen>
      <Text variant="title">{t('login.title')}</Text>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label={t('login.email')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label={t('login.password')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={onSubmit}
            error={errors.password?.message}
          />
        )}
      />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button title={t('login.submit')} onPress={onSubmit} loading={isSubmitting} />
    </Screen>
  );
}

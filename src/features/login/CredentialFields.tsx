import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { t } from '@/i18n';
import { Icon, Text, isIOS } from '@/ui';

import { useLoginPalette, type LoginPalette } from './palette';

type FieldProps = Pick<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'onSubmitEditing'> & {
  error?: string;
};

function PasswordToggle({
  shown,
  onPress,
  palette,
}: {
  shown: boolean;
  onPress: () => void;
  palette: LoginPalette;
}) {
  return (
    <Pressable
      testID="login-password-toggle"
      accessibilityRole="button"
      accessibilityLabel={shown ? t('login.hidePassword') : t('login.showPassword')}
      onPress={onPress}
      hitSlop={6}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={shown ? 'eyeSlash' : 'eye'} size={isIOS ? 20 : 24} color={palette.muted} />
    </Pressable>
  );
}

const emailInput: TextInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  autoComplete: 'email',
  keyboardType: 'email-address',
  textContentType: 'username',
  returnKeyType: 'next',
};

const passwordInput: TextInputProps = {
  autoComplete: 'current-password',
  textContentType: 'password',
  returnKeyType: 'go',
};

/** iOS: both fields in one rounded group, as in the system's own sign-in forms. */
function GroupedFields({ email, password }: { email: FieldProps; password: FieldProps }) {
  const { palette } = useLoginPalette();
  const [shown, setShown] = useState(false);
  const input = { flex: 1, fontSize: 17, color: palette.text, minHeight: 50 } as const;
  const errors = [email.error, password.error].filter(Boolean);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ backgroundColor: palette.surface, borderRadius: 26, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <TextInput
            testID="login-email"
            accessibilityLabel={t('login.email')}
            placeholder={t('login.email')}
            placeholderTextColor={palette.muted}
            {...emailInput}
            {...email}
            style={input}
          />
        </View>
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            marginLeft: 16,
            backgroundColor: palette.separator,
          }}
        />
        <View
          style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 4 }}
        >
          <TextInput
            testID="login-password"
            accessibilityLabel={t('login.password')}
            placeholder={t('login.password')}
            placeholderTextColor={palette.muted}
            secureTextEntry={!shown}
            {...passwordInput}
            {...password}
            style={input}
          />
          <PasswordToggle shown={shown} onPress={() => setShown((s) => !s)} palette={palette} />
        </View>
      </View>
      {errors.map((e) => (
        <Text key={e} style={{ fontSize: 13, color: palette.errorText, marginHorizontal: 16 }}>
          {e}
        </Text>
      ))}
    </View>
  );
}

/** Android: a Material outlined text field, its label floating on the border once focused or filled. */
function OutlinedField({
  label,
  testID,
  inputProps,
  field,
  trailing,
}: {
  label: string;
  testID: string;
  inputProps: TextInputProps;
  field: FieldProps;
  trailing?: React.ReactNode;
}) {
  const { palette } = useLoginPalette();
  const [focused, setFocused] = useState(false);
  const floating = focused || !!field.value;
  const color = field.error ? palette.errorText : focused ? palette.focus : palette.border;
  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 56,
          paddingLeft: 16,
          paddingRight: trailing ? 4 : 16,
          borderRadius: 4,
          borderWidth: focused ? 2 : 1,
          borderColor: color,
        }}
      >
        <Text
          style={{
            position: 'absolute',
            left: 12,
            paddingHorizontal: 4,
            backgroundColor: floating ? palette.background : 'transparent',
            ...(floating ? { top: -9, fontSize: 12 } : { top: 17, fontSize: 16 }),
            color: floating ? color : palette.muted,
          }}
          importantForAccessibility="no"
        >
          {label}
        </Text>
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          underlineColorAndroid="transparent"
          {...inputProps}
          {...field}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            field.onBlur?.(e);
          }}
          style={{ flex: 1, fontSize: 16, color: palette.text, padding: 0 }}
        />
        {trailing}
      </View>
      {field.error ? (
        <Text style={{ fontSize: 12, color: palette.errorText, marginHorizontal: 16 }}>
          {field.error}
        </Text>
      ) : null}
    </View>
  );
}

function OutlinedFields({ email, password }: { email: FieldProps; password: FieldProps }) {
  const { palette } = useLoginPalette();
  const [shown, setShown] = useState(false);
  return (
    <View style={{ gap: 20 }}>
      <OutlinedField
        label={t('login.email')}
        testID="login-email"
        inputProps={emailInput}
        field={email}
      />
      <OutlinedField
        label={t('login.password')}
        testID="login-password"
        inputProps={{ ...passwordInput, secureTextEntry: !shown }}
        field={password}
        trailing={
          <PasswordToggle shown={shown} onPress={() => setShown((s) => !s)} palette={palette} />
        }
      />
    </View>
  );
}

/** E-mail and password, in each platform's own form idiom; the password can be revealed. */
export function CredentialFields(props: { email: FieldProps; password: FieldProps }) {
  return isIOS ? <GroupedFields {...props} /> : <OutlinedFields {...props} />;
}

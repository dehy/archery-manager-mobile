import { Image } from 'expo-image';
import { isTag, isText as isDomText, type ChildNode, type Element } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import { Fragment, type ReactNode } from 'react';
import {
  Linking,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
} from 'react-native';

import { Text } from '../primitives';
import { spacing, useTheme, type Theme } from '../theme';

/*
 * Native renderer for the sanitized HTML of the API (practice advice). The server converts the
 * coach's Markdown to HTML and keeps only Symfony's "safe elements", https/mailto links and https
 * images, so no WebView is needed: text follows the system font size and screen readers read it
 * like the rest of the app.
 *
 * Inline elements become nested <Text>; everything else is a block. Blocks without a dedicated
 * rendering (div, section, figure, dl...) are plain containers, so an element the sanitizer lets
 * through is never dropped, only rendered without special styling.
 */

type Node = ChildNode;

const INLINE = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'font',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
]);
const HEADING_SIZE: Partial<Record<string, number>> = {
  h1: 24,
  h2: 21,
  h3: 18,
  h4: 17,
  h5: 16,
  h6: 15,
};
const MONO = process.env.EXPO_OS === 'ios' ? 'Menlo' : 'monospace';

const isElement = (n: Node): n is Element => isTag(n);
const isText = isDomText;
const isInline = (n: Node) => !isElement(n) || INLINE.has(n.name);
const isBlank = (n: Node) => isText(n) && n.data.trim() === '';

/** Links the sanitizer keeps; anything else is shown as plain text, never opened. */
export const isSafeLink = (href: string | undefined): href is string =>
  !!href && /^(https:|mailto:)/i.test(href.trim());

const isSafeImage = (src: string | undefined): src is string =>
  !!src && /^https:/i.test(src.trim());

function inlineStyle(name: string, theme: Theme): TextStyle | undefined {
  switch (name) {
    case 'b':
    case 'strong':
      return { fontWeight: '700' };
    case 'em':
    case 'i':
    case 'cite':
    case 'dfn':
    case 'var':
      return { fontStyle: 'italic' };
    case 'u':
    case 'ins':
      return { textDecorationLine: 'underline' };
    case 's':
    case 'del':
    case 'strike':
      return { textDecorationLine: 'line-through' };
    case 'code':
    case 'kbd':
    case 'samp':
      return { fontFamily: MONO, backgroundColor: theme.tint };
    case 'mark':
      return { backgroundColor: theme.tint };
    case 'small':
    case 'sub':
    case 'sup':
      return { fontSize: 12 };
    default:
      return undefined;
  }
}

function renderInline(node: Node, key: number, theme: Theme, pre: boolean): ReactNode {
  if (isText(node)) return pre ? node.data : node.data.replace(/\s+/g, ' ');
  if (!isElement(node)) return null;
  if (node.name === 'br') return '\n';
  if (node.name === 'wbr') return null;
  if (node.name === 'img') return null; // images are blocks, handled by renderBlocks

  const children = node.children.map((c, i) => renderInline(c, i, theme, pre));
  if (node.name === 'a') {
    const href = node.attribs.href;
    if (!isSafeLink(href)) return <Fragment key={key}>{children}</Fragment>;
    return (
      <RNText
        key={key}
        accessibilityRole="link"
        style={{ color: theme.primary, textDecorationLine: 'underline' }}
        onPress={() => Linking.openURL(href.trim())}
      >
        {children}
      </RNText>
    );
  }
  if (node.name === 'q') return <Fragment key={key}>« {children} »</Fragment>;
  return (
    <RNText key={key} style={inlineStyle(node.name, theme)}>
      {children}
    </RNText>
  );
}

function renderTable(table: Element, key: string, theme: Theme): ReactNode {
  const rows: Element[] = [];
  const collect = (nodes: Node[]) => {
    for (const n of nodes) {
      if (!isElement(n)) continue;
      if (n.name === 'tr') rows.push(n);
      else if (['thead', 'tbody', 'tfoot'].includes(n.name)) collect(n.children);
    }
  };
  collect(table.children);
  const cellsOf = (row: Element) =>
    row.children.filter((c): c is Element => isElement(c) && (c.name === 'td' || c.name === 'th'));
  const columns = Math.max(0, ...rows.map((r) => cellsOf(r).length));
  if (columns === 0) return null;
  // Narrow screens: let wide tables scroll sideways rather than squeezing every column.
  const cellWidth = columns > 3 ? 120 : undefined;

  const grid = (
    <View
      style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: 6 }}
    >
      {rows.map((row, r) => (
        <View
          key={r}
          style={{
            flexDirection: 'row',
            borderTopWidth: r === 0 ? 0 : StyleSheet.hairlineWidth,
            borderColor: theme.border,
          }}
        >
          {cellsOf(row).map((cell, c) => (
            <View
              key={c}
              style={{
                flex: cellWidth ? undefined : 1,
                width: cellWidth,
                padding: 8,
                borderLeftWidth: c === 0 ? 0 : StyleSheet.hairlineWidth,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontWeight: cell.name === 'th' ? '700' : '400', fontSize: 14 }}>
                {cell.children.map((n, i) => renderInline(n, i, theme, false))}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  return cellWidth ? (
    <ScrollView key={key} horizontal showsHorizontalScrollIndicator={false}>
      {grid}
    </ScrollView>
  ) : (
    <View key={key}>{grid}</View>
  );
}

function renderBlocks(nodes: Node[], theme: Theme): ReactNode[] {
  const out: ReactNode[] = [];
  let run: Node[] = [];

  const flush = () => {
    // Drop the whitespace HTML puts between blocks; keep inner spaces.
    while (run.length && isBlank(run[0])) run.shift();
    while (run.length && isBlank(run[run.length - 1])) run.pop();
    if (run.length) {
      out.push(
        <Text key={`t${out.length}`} style={{ lineHeight: 22 }}>
          {run.map((n, i) => renderInline(n, i, theme, false))}
        </Text>,
      );
    }
    run = [];
  };

  for (const node of nodes) {
    if (isInline(node) && !(isElement(node) && node.name === 'img')) {
      run.push(node);
      continue;
    }
    flush();
    if (!isElement(node)) continue;
    const el = node;
    const key = `b${out.length}`;
    const name = el.name;
    const headingSize = HEADING_SIZE[name];

    if (name === 'hr') {
      out.push(
        <View
          key={key}
          style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border }}
        />,
      );
    } else if (name === 'img') {
      if (isSafeImage(el.attribs.src)) {
        out.push(
          <Image
            key={key}
            source={{ uri: el.attribs.src.trim() }}
            accessibilityLabel={el.attribs.alt || undefined}
            contentFit="contain"
            style={{ width: '100%', aspectRatio: 16 / 9 }}
          />,
        );
      }
    } else if (headingSize) {
      out.push(
        <Text
          key={key}
          accessibilityRole="header"
          style={{ fontSize: headingSize, fontWeight: '700' }}
        >
          {el.children.map((c, i) => renderInline(c, i, theme, false))}
        </Text>,
      );
    } else if (name === 'ul' || name === 'ol') {
      const items = el.children.filter((c): c is Element => isElement(c) && c.name === 'li');
      const start = Number(el.attribs.start) || 1;
      out.push(
        <View key={key} style={{ gap: 4 }}>
          {items.map((li, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ fontVariant: ['tabular-nums'] }}>
                {name === 'ol' ? `${start + i}.` : '•'}
              </Text>
              <View style={{ flex: 1, gap: 4 }}>{renderBlocks(li.children, theme)}</View>
            </View>
          ))}
        </View>,
      );
    } else if (name === 'blockquote') {
      out.push(
        <View
          key={key}
          style={{ borderLeftWidth: 3, borderLeftColor: theme.border, paddingLeft: 12, gap: 8 }}
        >
          {renderBlocks(el.children, theme)}
        </View>,
      );
    } else if (name === 'pre') {
      out.push(
        <ScrollView key={key} horizontal showsHorizontalScrollIndicator={false}>
          <Text style={{ fontFamily: MONO, fontSize: 13, backgroundColor: theme.tint, padding: 8 }}>
            {el.children.map((c, i) => renderInline(c, i, theme, true))}
          </Text>
        </ScrollView>,
      );
    } else if (name === 'table') {
      out.push(renderTable(el, key, theme));
    } else {
      // p, div, li outside a list, section, figure, dl, details...: a plain container.
      const inner = renderBlocks(el.children, theme);
      if (inner.length) {
        out.push(
          <View key={key} style={{ gap: spacing.sm }}>
            {inner}
          </View>,
        );
      }
    }
  }
  flush();
  return out;
}

export function HtmlContent({ html }: { html: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>{renderBlocks(parseDocument(html).children, theme)}</View>
  );
}

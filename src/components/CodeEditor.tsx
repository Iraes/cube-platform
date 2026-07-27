"use client";

import { useEffect, useRef } from "react";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";

/**
 * Подсветка на CSS-переменных: при смене темы редактор
 * перекрашивается сам, пересоздавать EditorView не нужно.
 */
const highlightStyle = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.controlKeyword, tags.moduleKeyword, tags.definitionKeyword],
    color: "var(--syn-keyword)",
  },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--syn-string)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--syn-number)" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "var(--syn-comment)", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "var(--syn-func)" },
  { tag: [tags.propertyName, tags.className, tags.typeName], color: "var(--syn-prop)" },
  { tag: [tags.operator, tags.punctuation, tags.bracket], color: "var(--syn-op)" },
  { tag: tags.regexp, color: "var(--syn-number)" },
]);

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
};

export function CodeEditor({ value, onChange, onRun }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Колбэки живут в ref, чтобы не пересоздавать редактор на каждый рендер
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          javascript(),
          syntaxHighlighting(highlightStyle),
          // Ctrl+Enter должен победить дефолтную вставку строки
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                preventDefault: true,
                run: () => {
                  onRunRef.current();
                  return true;
                },
              },
            ]),
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Редактор создаётся один раз: value синхронизируется отдельным эффектом
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Внешнее изменение кода (кнопка «Сбросить») — вливаем в документ
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (current === value) return;

    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  return <div ref={hostRef} className="h-full overflow-hidden" />;
}

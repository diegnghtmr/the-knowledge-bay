// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import useFormState from '../src/components/help/useFormState.js';

it('keeps field refs stable when the required fields change and focuses the first invalid field', () => {
  const { result, rerender } = renderHook(({ required }) => useFormState({ name: '', details: '' }, required), {
    initialProps: { required: ['name'] },
  });
  const ref = result.current.refs.name;
  rerender({ required: ['name', 'details'] });
  expect(result.current.refs.name).toBe(ref);
  expect(result.current.refs.details).not.toBe(ref);

  const focus = vi.fn();
  const preventDefault = vi.fn();
  const submit = vi.fn();
  ref.current = { focus };
  act(() => result.current.handleSubmit({ preventDefault }, submit));
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
  expect(result.current.shouldShowError('name')).toBe('Obligatorio');
});

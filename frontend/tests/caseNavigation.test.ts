import assert from 'node:assert/strict'
import test from 'node:test'
import { selectRelatedCases } from '../utils/caseNavigation.ts'
import type { IProjects } from '../utils/interfaces/IProjects'
const project = (slug: string, sort_order: number, is_featured = false) => ({ id: slug, slug, name: slug, type: 'Demo', sort_order, is_featured, metrics: [] } as IProjects)
const projects = [project('current', 0, true), project('a', 3), project('b', 2, true), project('c', 1), project('d', 4)]
test('automatic selection excludes current case and duplicates and prioritizes featured', () => {
  assert.deepEqual(selectRelatedCases([...projects, projects[2]], {}, 'current').map(p => p.slug), ['b', 'c', 'a'])
})
test('editor selection preserves order and excludes unavailable or self links', () => {
  assert.deepEqual(selectRelatedCases(projects, { case_slugs: ['a', 'missing', 'current', 'c', 'a', 'd'] }, 'current').map(p => p.slug), ['a', 'c', 'd'])
})
test('legacy slug works while an explicit empty list enables automatic selection', () => {
  assert.deepEqual(selectRelatedCases(projects, { case_slug: 'a' }, 'current').map(p => p.slug), ['a'])
  assert.deepEqual(selectRelatedCases(projects, { case_slug: 'a', case_slugs: [] }, 'current').map(p => p.slug), ['b', 'c', 'a'])
})
test('unavailable manual selection is not replaced with unrelated cases', () => {
  assert.deepEqual(selectRelatedCases(projects, { case_slugs: ['hidden'] }, 'current'), [])
  assert.deepEqual(selectRelatedCases([], {}, 'current'), [])
})

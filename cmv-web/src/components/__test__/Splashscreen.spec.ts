import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils'
import Splashscreen from '../Splashscreen.vue';

describe('Splashscreen.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(Splashscreen);
    expect(wrapper.html()).toMatchSnapshot(); // Vérifie que le HTML correspond au rendu attendu
  });

  it('has the correct structure', () => {
    const wrapper = mount(Splashscreen);
    const div = wrapper.find('div');
    const span = wrapper.find('span');
    expect(div.exists()).toBe(true); // Vérifie que la div existe
    expect(div.classes()).toContain('h-screen');
    expect(div.classes()).toContain('grid');
    expect(div.classes()).toContain('place-items-center');

    expect(span.exists()).toBe(true); // Vérifie que le span existe
    expect(span.classes()).toContain('loader');
  });
});

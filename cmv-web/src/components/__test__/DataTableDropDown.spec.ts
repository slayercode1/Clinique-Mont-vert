import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import DataTableDropdown from '@/components/data-table-dropdown.vue';

describe('DataTableDropdown.vue', () => {
  const mockRouterPush = vi.fn();
  const mockHandleDelete = vi.fn();

  vi.mock('vue-router', () => ({
    useRouter: () => ({
      push: mockRouterPush,
    }),
  }));

  const defaultProps = {
    data: { id: 1 },
    url: '/update',
    url_detail: '/details',
    detail: true,
    handleDelete: mockHandleDelete,
  };

  it('renders the dropdown menu with all items if props allow', async () => {
    const wrapper = mount(DataTableDropdown, {
      props: {
        ...defaultProps,
        url_update: true,
        detail: true,
      },
    });

    // Vérifier que le bouton principal existe
    expect(wrapper.find('button').exists()).toBe(true);

    // Vérifier que le menu contient les bonnes options
    expect(wrapper.text()).toContain('View Update');
    expect(wrapper.text()).toContain('View vehicle details');
    expect(wrapper.text()).toContain('Supprimer');
  });

  it('redirects to the correct URL on "View Update" click', async () => {
    const wrapper = mount(DataTableDropdown, {
      props: {
        ...defaultProps,
        url_update: true,
      },
    });

    await wrapper.find('button').trigger('click'); // Ouvre le menu
    const viewUpdateOption = wrapper.findAll('button')[1]; // Première entrée du menu
    await viewUpdateOption.trigger('click');

    expect(mockRouterPush).toHaveBeenCalledWith({
      path: '/update',
      state: {
        data: JSON.stringify(defaultProps.data),
      },
    });
  });

  it('redirects to the correct URL on "View vehicle details" click', async () => {
    const wrapper = mount(DataTableDropdown, {
      props: {
        ...defaultProps,
        detail: true,
      },
    });

    await wrapper.find('button').trigger('click'); // Ouvre le menu
    const detailsOption = wrapper.findAll('button')[2]; // Deuxième entrée du menu
    await detailsOption.trigger('click');

    expect(mockRouterPush).toHaveBeenCalledWith({
      path: '/details',
      state: {
        data: JSON.stringify(defaultProps.data),
      },
    });
  });

  it('calls handleDelete when confirming delete in the dialog', async () => {
    const wrapper = mount(DataTableDropdown, {
      props: defaultProps,
    });

    await wrapper.find('button').trigger('click'); // Ouvre le menu
    const deleteOption = wrapper.findAll('button')[3]; // Troisième entrée du menu
    await deleteOption.trigger('click');

    // Simuler confirmation dans la boîte de dialogue
    const confirmButton = wrapper.find('button:contains("Oui")');
    await confirmButton.trigger('click');

    expect(mockHandleDelete).toHaveBeenCalled();
  });
});

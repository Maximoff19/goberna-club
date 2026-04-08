export function openProfileSearchOverlay(): void {
  window.dispatchEvent(new CustomEvent('app:open-profile-search'));
}

export function toggleProfileEditMode(): void {
  window.dispatchEvent(new CustomEvent('app:toggle-profile-edit-mode'));
}

interface ProfileSectionEditorDetail {
  sectionKey: string;
  itemIndex: number;
}

export function openProfileSectionEditor(sectionKey: string, itemIndex: number): void {
  window.dispatchEvent(
    new CustomEvent<ProfileSectionEditorDetail>('app:open-profile-section-editor', {
      detail: { sectionKey, itemIndex },
    })
  );
}

interface ProfileSectionKeyDetail {
  sectionKey: string;
}

export function addProfileSectionItem(sectionKey: string): void {
  window.dispatchEvent(
    new CustomEvent<ProfileSectionKeyDetail>('app:add-profile-section-item', {
      detail: { sectionKey },
    })
  );
}

interface ProfileSectionRemoveDetail {
  sectionKey: string;
  itemIndex: number;
}

export function removeProfileSectionItem(sectionKey: string, itemIndex: number): void {
  window.dispatchEvent(
    new CustomEvent<ProfileSectionRemoveDetail>('app:remove-profile-section-item', {
      detail: { sectionKey, itemIndex },
    })
  );
}

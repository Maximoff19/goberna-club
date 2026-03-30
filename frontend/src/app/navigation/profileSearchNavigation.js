export function openProfileSearchOverlay() {
  window.dispatchEvent(new CustomEvent('app:open-profile-search'));
}

export function toggleProfileEditMode() {
  window.dispatchEvent(new CustomEvent('app:toggle-profile-edit-mode'));
}

export function openProfileSectionEditor(sectionKey, itemIndex) {
  window.dispatchEvent(
    new CustomEvent('app:open-profile-section-editor', {
      detail: { sectionKey, itemIndex },
    })
  );
}

export function addProfileSectionItem(sectionKey) {
  window.dispatchEvent(
    new CustomEvent('app:add-profile-section-item', {
      detail: { sectionKey },
    })
  );
}

export function removeProfileSectionItem(sectionKey, itemIndex) {
  window.dispatchEvent(
    new CustomEvent('app:remove-profile-section-item', {
      detail: { sectionKey, itemIndex },
    })
  );
}

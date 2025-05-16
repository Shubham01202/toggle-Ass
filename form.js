(() => {
  const STORAGE_KEY = 'gadgetstore_listings';

  const form = document.getElementById('listingForm');
  const formTitle = document.getElementById('formTitle');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('imagePreview');
  const formMessage = document.getElementById('formMessage');
  const formError = document.getElementById('formError');
  const conditionError = document.getElementById('conditionError');

  let editId = null;
  let currentUser = auth.getUser();

  // Utility to get query param by name
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // Load listings from localStorage
  function loadListings() {
    const listingsJson = localStorage.getItem(STORAGE_KEY);
    if (!listingsJson) return [];
    try {
      return JSON.parse(listingsJson);
    } catch {
      return [];
    }
  }

  // Save listings to localStorage
  function saveListings(listings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  }

  // Populate form if editing
  function populateForm(listing) {
    formTitle.textContent = 'Edit Gadget Listing';
    form.brand.value = listing.brand;
    form.model.value = listing.model;
    form.price.value = listing.price;
    form.processor.value = listing.processor;
    form.battery.value = listing.battery;
    form.category.value = listing.category;
    if (listing.condition === 'New') {
      form.condition.value = 'New';
      form.condition[0].checked = true;
    } else {
      form.condition.value = 'Old';
      form.condition[1].checked = true;
    }
    if (listing.image) {
      imagePreview.src = listing.image;
      imagePreview.classList.remove('d-none');
      imageInput.required = false; // Image already exists on edit
    }
  }

  // Handle image file change to show preview
  function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) {
      imagePreview.src = '';
      imagePreview.classList.add('d-none');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      imagePreview.src = event.target.result;
      imagePreview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  }

  // Validate condition radio, since Bootstrap doesn't handle it well
  function validateCondition() {
    const conds = form.querySelectorAll('input[name="condition"]');
    let selected = false;
    conds.forEach((c) => {
      if (c.checked) selected = true;
    });
    if (!selected) {
      conditionError.style.display = 'block';
      return false;
    }
    conditionError.style.display = 'none';
    return true;
  }

  // Generate unique ID for new listing
  function generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  // Get image data: either new upload or existing preview src
  function getImageData() {
    return new Promise((resolve) => {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          resolve(event.target.result);
        };
        reader.readAsDataURL(file);
      } else if (imagePreview.src) {
        resolve(imagePreview.src);
      } else {
        resolve(null);
      }
    });
  }

  form.image.addEventListener('change', handleImagePreview);

  // Load listing if editing
  document.addEventListener('DOMContentLoaded', () => {
    editId = getQueryParam('id');
    if (editId) {
      const listings = loadListings();
      const listingToEdit = listings.find((l) => l.id === editId);
      if (listingToEdit) {
        populateForm(listingToEdit);
      } else {
        alert('Listing not found, creating a new one.');
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';
    formError.textContent = '';

    // Bootstrap validation
    if (!form.checkValidity() || !validateCondition()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const brand = form.brand.value.trim();
    const model = form.model.value.trim();
    const price = parseFloat(form.price.value);
    const processor = form.processor.value.trim();
    const battery = form.battery.value.trim();
    const category = form.category.value;
    const condition = form.querySelector('input[name="condition"]:checked').value;

    const imageData = await getImageData();

    if (!imageData) {
      formError.textContent = 'Image is required.';
      return;
    }

    const listings = loadListings();

    if (editId) {
      // Editing existing listing
      const index = listings.findIndex((l) => l.id === editId);
      if (index === -1) {
        formError.textContent = 'Listing not found.';
        return;
      }
      if (listings[index].owner !== currentUser.username) {
        formError.textContent = 'You do not have permission to edit this listing.';
        return;
      }
      listings[index] = {
        ...listings[index],
        brand,
        model,
        price,
        processor,
        battery,
        category,
        condition,
        image: imageData,
      };
    } else {
      // Adding new listing
      listings.push({
        id: generateId(),
        brand,
        model,
        price,
        processor,
        battery,
        category,
        condition,
        image: imageData,
        owner: currentUser.username,
      });
    }

    saveListings(listings);
    formMessage.textContent = 'Listing saved successfully! Redirecting...';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  });
})();

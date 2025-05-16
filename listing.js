const listing = (() => {
  const STORAGE_KEY = 'gadgetstore_listings';

  // Load listings from localStorage or initialize with an empty array
  function loadListings() {
    const listingsJson = localStorage.getItem(STORAGE_KEY);
    if (!listingsJson) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([])); // Start with an empty array
      return [];
    }
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

  // Create DOM element for a single listing card
  function createCard(listingData) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'listing-card-wrapper'; // wrapper for layout styling

    const card = document.createElement('div');
    card.className = 'listing-card';

    const img = document.createElement('img');
    img.src = listingData.image || 'https://via.placeholder.com/400x180?text=No+Image';
    img.alt = `${listingData.brand} ${listingData.model}`;

    const details = document.createElement('div');
    details.className = 'listing-details';

    const title = document.createElement('h5');
    title.className = 'listing-title';
    title.textContent = listingData.model;

    const brand = document.createElement('p');
    brand.className = 'listing-brand';
    brand.textContent = `Brand: ${listingData.brand}`;

    const info = document.createElement('p');
    info.className = 'listing-info';
    info.innerHTML = `
      Processor: ${listingData.processor}<br />
      Battery: ${listingData.battery}<br />
      Category: ${listingData.category}<br />
      Condition: ${listingData.condition}
    `;

    const price = document.createElement('p');
    price.className = 'listing-price';
    price.textContent = `$${listingData.price.toFixed(2)}`;

    details.appendChild(title);
    details.appendChild(brand);
    details.appendChild(info);
    details.appendChild(price);

    // Button group
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    // Check ownership to show Edit/Delete buttons
    const currentUser = auth.getUser();
    if (currentUser && currentUser.username === listingData.owner) {
      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-outline-primary';
      editBtn.textContent = 'Edit';
      editBtn.title = 'Edit listing';
      editBtn.onclick = () => {
        window.location.href = `add-listing.html?id=${listingData.id}`;
      };
      btnGroup.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-outline-danger';
      delBtn.textContent = 'Delete';
      delBtn.title = 'Delete listing';
      delBtn.onclick = () => {
        if (confirm(`Delete listing "${listingData.model}"? This cannot be undone.`)) {
          deleteListing(listingData.id);
        }
      };
      btnGroup.appendChild(delBtn);
    }

    details.appendChild(btnGroup);
    card.appendChild(img);
    card.appendChild(details);
    cardWrapper.appendChild(card);

    return cardWrapper;
  }

  // Render listings grid
  function renderListings() {
    const container = document.getElementById('listingsGrid');
    if (!container) return;

    const listings = loadListings();
    container.innerHTML = '';

    if (listings.length === 0) {
      const noData = document.createElement('p');
      noData.className = 'text-muted';
      noData.textContent = 'No listings available.';
      container.appendChild(noData);
      return;
    }

    listings.forEach((listingData) => {
      const card = createCard(listingData);
      container.appendChild(card);
    });
  }

  // Delete listing by id
  function deleteListing(id) {
    let listings = loadListings();
    listings = listings.filter((lst) => lst.id !== id);
    saveListings(listings);
    renderListings();
  }

  // Update layout based on selected view ('grid' or 'list')
  function updateLayout(layout) {
    const container = document.getElementById('listingsGrid');
    if (!container) return;
    container.classList.remove('list-layout-grid', 'list-layout-list');
    if (layout === 'list') {
      container.classList.add('list-layout-list');
    } else {
      container.classList.add('list-layout-grid');
    }
  }

  // Initialize listeners
  function init() {
    // Rerender listings on auth changes to update buttons
    auth.listenAuthChanges(() => renderListings());
  }

  init();

  return {
    renderListings,
    deleteListing,
    updateLayout,
  };
})();


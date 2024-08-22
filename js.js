// regular expression for validation
const strRegex =  /^[a-zA-Z\s]*$/; // containing only letters
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
/* supports following number formats - (123) 456-7890, (123)456-7890, 123-456-7890, 123.456.7890, 1234567890, +31636363634, 075-63546725 */
const digitRegex = /^\d+$/;

// -------------------------------------------------- //

const countryList = document.getElementById('country-list');
const fullscreenDiv = document.getElementById('fullscreen-div');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.getElementById('close-btn');
const modalBtns = document.getElementById('modal-btns');
const form = document.getElementById('modal');
const addrBookList = document.querySelector('#addr-book-list table tbody');

const peopleCountDiv = document.getElementById('people-count');

const searchBox = document.getElementById('search-box');
let allAddresses = [];

// -------------------------------------------------- //
let addrName = firstName = lastName = email = phone = streetAddr = postCode = city = country = labels = "";

// Address class
class Address{
    constructor(id, addrName, firstName, lastName, email, phone, streetAddr, postCode, city, country, labels, profilePic){
        this.id = id;
        this.addrName = addrName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.streetAddr = streetAddr;
        this.postCode = postCode;
        this.city = city;
        this.country = country;
        this.labels = labels;
        this.profilePic = profilePic;
    }

    static getAddresses(){
        // from local storage
        let addresses;
        if(localStorage.getItem('addresses') == null){
            addresses = [];
        } else {
            addresses = JSON.parse(localStorage.getItem('addresses'));
        }
        return addresses;
    }

    static addAddress(address){
        const addresses = Address.getAddresses();
        addresses.push(address);
        try {
            localStorage.setItem('addresses', JSON.stringify(addresses));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some addresses to add more.');
            }
            console.error('Error saving address:', e);
        }
        updatePeopleCount();
    }

    static deleteAddress(id){
        const addresses = Address.getAddresses();
        addresses.forEach((address, index) => {
            if(address.id == id){
                addresses.splice(index, 1);
            }
        });
        localStorage.setItem('addresses', JSON.stringify(addresses));
        form.reset();
        UI.closeModal();
        addrBookList.innerHTML = "";
        UI.showAddressList();
        updatePeopleCount(); // Update count after deleting an address
    }

    static updateAddress(item){
        const addresses = Address.getAddresses();
        addresses.forEach(address => {
            if(address.id == item.id){
                address.addrName = item.addrName;
                address.firstName = item.firstName;
                address.lastName = item.lastName;
                address.email = item.email;
                address.phone = item.phone;
                address.streetAddr = item.streetAddr;
                address.postCode = item.postCode;
                address.city = item.city;
                address.country = item.country;
                address.labels = item.labels;
                address.profilePic = item.profilePic;
            }
        });
        localStorage.setItem('addresses', JSON.stringify(addresses));
        addrBookList.innerHTML = "";
        UI.showAddressList();
        updatePeopleCount(); // Update count after updating an address
    }
}

// UI class
class UI{
    static showAddressList(){
        allAddresses = Address.getAddresses();
        UI.displayFilteredAddresses(allAddresses);
    }

    static displayFilteredAddresses(addresses) {
        if (addrBookList) {
            addrBookList.innerHTML = ''; // Clear only the tbody content
            addresses.forEach(address => UI.addToAddressList(address));
            updatePeopleCount(addresses.length);
        } else {
            console.error('Address book list tbody not found');
        }
    }

    static addToAddressList(address){
        const tableRow = document.createElement('tr');
        tableRow.setAttribute('data-id', address.id);
        tableRow.innerHTML = `
            <td>${address.id}</td>
            <td>
                <div class="address-info">
                    <img src="${address.profilePic || 'default-profile.png'}" alt="Profile" class="profile-pic" onerror="this.src='default-profile.png';">
                    <div>
                        <span class="addressing-name">${address.addrName}</span><br>
                        <span class="address">${address.streetAddr} ${address.postCode} ${address.city} ${address.country}</span>
                    </div>
                </div>
            </td>
            <td><span>${address.labels}</span></td>
            <td>${address.firstName + " " + address.lastName}</td>
            <td>${address.phone}</td>
        `;
        addrBookList.appendChild(tableRow);
    }

    static showModalData(id){
        const addresses = Address.getAddresses();
        addresses.forEach(address => {
            if(address.id == id){
                form.addr_ing_name.value = address.addrName;
                form.first_name.value = address.firstName;
                form.last_name.value = address.lastName;
                form.email.value = address.email;
                form.phone.value = address.phone;
                form.street_addr.value = address.streetAddr;
                form.postal_code.value = address.postCode;
                form.city.value = address.city;
                form.country.value = address.country;
                form.labels.value = address.labels;
                document.getElementById('modal-title').innerHTML = "Change Address Details";

                document.getElementById('modal-btns').innerHTML = `
                    <button type = "submit" id = "update-btn" data-id = "${id}">Update </button>
                    <button type = "button" id = "delete-btn" data-id = "${id}">Delete </button>
                `;
            }
        });
    }

    static showModal(){
        modal.style.display = "block";
        fullscreenDiv.style.display = "block";
    }

    static closeModal(){
        modal.style.display = "none";
        fullscreenDiv.style.display = "none";
    }

}

// DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
    loadJSON(); // loading country list from json file
    eventListeners();
    UI.showAddressList();
    updatePeopleCount(); // Call updatePeopleCount when the page loads
});

// event listeners
function eventListeners(){
    // show add item modal
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('modal-title').innerHTML = "Add Address";
        UI.showModal();
        document.getElementById('modal-btns').innerHTML = `
            <button type = "submit" id = "save-btn"> Save </button>
        `;
    });

    // close add item modal
    closeBtn.addEventListener('click', UI.closeModal);

    // add an address item
    modalBtns.addEventListener('click', async (event) => {
        event.preventDefault();
        if(event.target.id == "save-btn"){
            try {
                let formData = await getFormData();
                let allItem = Address.getAddresses();
                let lastItemId = (allItem.length > 0) ? allItem[allItem.length - 1].id : 0;
                lastItemId++;

                const addressItem = new Address(lastItemId, formData.addrName, formData.firstName, formData.lastName, formData.email, formData.phone, formData.streetAddr, formData.postCode, formData.city, formData.country, formData.labels, formData.profilePic);
                Address.addAddress(addressItem);
                UI.closeModal();
                UI.addToAddressList(addressItem);
                form.reset();
                updatePeopleCount(); // Call updatePeopleCount after adding a new address
            } catch (error) {
                console.error('Error adding address:', error);
                // Handle error (e.g., show error message to user)
            }
        }
    });

    // table row items
    addrBookList.addEventListener('click', (event) => {
        UI.showModal();
        let trElement;
        if(event.target.parentElement.tagName == "TD"){
            trElement = event.target.parentElement.parentElement;
        }

        if(event.target.parentElement.tagName == "TR"){
            trElement = event.target.parentElement;
        }

        let viewID = trElement.dataset.id;
        UI.showModalData(viewID);
    });

    // delete an address item
    modalBtns.addEventListener('click', (event) => {
        if(event.target.id == 'delete-btn'){
            Address.deleteAddress(event.target.dataset.id);
            updatePeopleCount(); // Call updatePeopleCount after deleting an address
        }
    });

    // update an address item
    modalBtns.addEventListener('click', (event) => {
        event.preventDefault();
        if(event.target.id == "update-btn"){
            let id = event.target.dataset.id;
            let formData = getFormData();
            if(formData){
                const addressItem = new Address(id, formData.addrName, formData.firstName, formData.lastName, formData.email, formData.phone, formData.streetAddr, formData.postCode, formData.city, formData.country, formData.labels, formData.profilePic);
                Address.updateAddress(addressItem);
                UI.closeModal();
                form.reset();
                updatePeopleCount(); // Call updatePeopleCount after updating an address
            }
        }
    });

    searchBox.addEventListener('input', handleSearch);
}

function handleSearch() {
    const searchTerm = searchBox.value.toLowerCase().trim();
    if (searchTerm === '') {
        UI.displayFilteredAddresses(allAddresses);
    } else {
        const filteredAddresses = allAddresses.filter(address => 
            address.addrName.toLowerCase().includes(searchTerm) ||
            address.firstName.toLowerCase().includes(searchTerm) ||
            address.lastName.toLowerCase().includes(searchTerm)
        );
        UI.displayFilteredAddresses(filteredAddresses);
    }
}

// load countries list
function loadJSON(){
    fetch('countries.json')
        .then(response => response.json())
        .then(data => {
            let html = "";
            data.forEach(country => {
                html += `<option>${country.country}</option>`;
            });
            if (countryList) {
                countryList.innerHTML = html;
            } else {
                console.error('Country list not found');
            }
        })
        .catch(error => console.error('Error loading countries:', error));
}


// get form data
function getFormData(){
    let inputValidStatus = [];
    // console.log(form.addr_ing_name.value, form.first_name.value, form.last_name.value, form.email.value, form.phone.value, form.street_addr.value, form.postal_code.value, form.city.value, form.country.value, form.labels.value);

    if(!strRegex.test(form.addr_ing_name.value) || form.addr_ing_name.value.trim().length == 0){
        addErrMsg(form.addr_ing_name);
        inputValidStatus[0] = false;
    } else {
        addrName = form.addr_ing_name.value;
        inputValidStatus[0] = true;
    }

    if(!strRegex.test(form.first_name.value) || form.first_name.value.trim().length == 0){
        addErrMsg(form.first_name);
        inputValidStatus[1] = false;
    } else {
        firstName = form.first_name.value;
        inputValidStatus[1] = true;
    }

    if(!strRegex.test(form.last_name.value) || form.last_name.value.trim().length == 0){
        addErrMsg(form.last_name);
        inputValidStatus[2] = false;
    } else {
        lastName = form.last_name.value;
        inputValidStatus[2] = true;
    }

    if(!emailRegex.test(form.email.value)){
        addErrMsg(form.email);
        inputValidStatus[3] = false;
    } else {
        email = form.email.value;
        inputValidStatus[3] = true;
    }

    if(!phoneRegex.test(form.phone.value)){
        addErrMsg(form.phone);
        inputValidStatus[4] = false;
    } else {
        phone = form.phone.value;
        inputValidStatus[4] = true;
    }

    if(!(form.street_addr.value.trim().length > 0)){
        addErrMsg(form.street_addr);
        inputValidStatus[5] = false;
    } else {
        streetAddr = form.street_addr.value;
        inputValidStatus[5] = true;
    }

    if(!digitRegex.test(form.postal_code.value)){
        addErrMsg(form.postal_code);
        inputValidStatus[6] = false;
    } else {
        postCode = form.postal_code.value;
        inputValidStatus[6] = true;
    }

    if(!strRegex.test(form.city.value) || form.city.value.trim().length == 0){
        addErrMsg(form.city);
        inputValidStatus[7] = false;
    } else {
        city = form.city.value;
        inputValidStatus[7] = true;
    }
    country = form.country.value;
    labels = form.labels.value;

    const profilePicInput = document.getElementById('profile-pic');
    let profilePic = '';

    // Return a promise that resolves with the form data
    return new Promise((resolve, reject) => {
        if (profilePicInput.files && profilePicInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePic = e.target.result;
                if (inputValidStatus.includes(false)) {
                    reject('Invalid input');
                } else {
                    resolve({
                        addrName, firstName, lastName, email, phone, streetAddr, postCode, city, country, labels, profilePic
                    });
                }
            };
            reader.onerror = function(e) {
                reject('Error reading file');
            };
            reader.readAsDataURL(profilePicInput.files[0]);
        } else {
            if (inputValidStatus.includes(false)) {
                reject('Invalid input');
            } else {
                resolve({
                    addrName, firstName, lastName, email, phone, streetAddr, postCode, city, country, labels, profilePic
                });
            }
        }
    });
}


function addErrMsg(inputBox){
    inputBox.classList.add('errorMsg');
}

function updatePeopleCount(count) {
    if (peopleCountDiv) {
        const peopleCount = count !== undefined ? count : (addrBookList ? addrBookList.children.length : 0);
        peopleCountDiv.textContent = `${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}`;
    } else {
        console.error('People count div not found');
    }
}

function initializeAddressBook() {
    UI.showAddressList();
    eventListeners();
    loadJSON();
}

document.addEventListener('DOMContentLoaded', initializeAddressBook);

// Function to clear all addresses
function clearAllAddresses() {
    // Clear addresses from local storage
    localStorage.removeItem('addresses');
    // Clear the address list in the UI
    addrBookList.innerHTML = '';
    // Update the people count
    updatePeopleCount(0);
}

// Add event listener for the clear all button
document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all addresses?')) {
        clearAllAddresses();
    }
});
function updatePeopleCount(count = allAddresses.length) {
    peopleCountDiv.textContent = `${count} people`;
}

/* Knockout here -- used to handle the list, filter and any other information that is subject to changing state -- the Model stuff */

var locations = [
    {
    title: 'Hippie Hollow Park',
    location: {
        lat: 30.413155,
        lng: -97.884064}
    },
    {
    title: 'Barton Springs',
    location: {
        lat: 30.2640024,
        lng: -97.7709723}
    },
    {title: 'Woodlawn (Pease Mansion)',
    location: {
        lat: 30.2640901,
        lng: -97.797237}
    },
    {
    title: 'West Sixth Street Bridge',
    location: {
        lat: 30.2730245,
        lng: -97.7601438}
    },
    {
    title: 'Austin State Hospital',
    location: {
        lat: 30.3075604,
        lng: -97.7392435}
    }
];




/* Maps API here -- used for creating markers, tracking click events on markers, making the map and refreshing the map. -- API stuff

Tracking click event on *list items* should be handled with KO -- View stuff */




/* Creating markers as part of your VM is recommended, but the cannot be knockout observables.
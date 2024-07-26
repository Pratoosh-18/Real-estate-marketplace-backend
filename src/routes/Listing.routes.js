import { Router } from 'express';
import { buyListing, createListing, getListings, getUserListings, deleteListing } from '../controllers/Listing.controller.js';

const listingRoutes = Router();

listingRoutes.post('/create', createListing);
listingRoutes.get('/getListings', getListings);
listingRoutes.get('/getUserListings', getUserListings);
listingRoutes.post('/buyListing', buyListing);
listingRoutes.delete('/deleteListing',deleteListing);

export default listingRoutes;

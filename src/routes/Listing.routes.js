import { Router } from 'express';
import { createListing, getListings, getUserListings } from '../controllers/Listing.controller.js';

const listingRoutes = Router();

listingRoutes.post('/create', createListing);
listingRoutes.get('/getListings', getListings);
listingRoutes.get('/getUserListings', getUserListings);

export default listingRoutes;

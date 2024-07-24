import { Router } from 'express';
import { createListing } from '../controllers/Listing.controller.js';

const listingRoutes = Router();

listingRoutes.post('/create', createListing);

export default listingRoutes;

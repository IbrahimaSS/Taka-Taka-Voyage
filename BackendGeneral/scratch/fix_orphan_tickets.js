const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Ticket = require('../src/models/Ticket');
const Reservation = require('../src/models/Reservations');

async function fixTickets() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/takataka");
        console.log("Connected!");

        const tickets = await Ticket.find({ 
            $or: [
                { passager: { $exists: false } }, 
                { passager: null } 
            ] 
        });

        console.log(`Found ${tickets.length} tickets without passenger ID.`);

        for (const ticket of tickets) {
            const res = await Reservation.findById(ticket.reservation);
            if (res && res.passager) {
                ticket.passager = res.passager;
                await ticket.save();
                console.log(`Fixed ticket ${ticket._id} for passenger ${res.passager}`);
            } else {
                console.log(`Could not fix ticket ${ticket._id}: reservation not found or has no passenger.`);
            }
        }

        console.log("Done!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

fixTickets();

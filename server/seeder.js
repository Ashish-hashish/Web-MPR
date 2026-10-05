const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Grievance = require('./models/Grievance');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_grievance_db');
    console.log('[MongoDB Connected for Seeder]');
  } catch (err) {
    console.error(`Error connecting DB: ${err.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear old data
    await User.deleteMany();
    await Grievance.deleteMany();
    console.log('[Seeder] Cleared existing Users and Grievances.');

    // Create demo users
    const citizen1 = await User.create({
      name: 'Rahul Sharma',
      email: 'citizen.rahul@example.com',
      password: 'password123',
      role: 'citizen'
    });

    const citizen2 = await User.create({
      name: 'Ananya Deshmukh',
      email: 'citizen.ananya@example.com',
      password: 'password123',
      role: 'citizen'
    });

    const worker1 = await User.create({
      name: 'Ramesh Patil (BMC Ward K-East)',
      email: 'bmc.worker@mumbai.gov.in',
      password: 'password123',
      role: 'worker'
    });

    const worker2 = await User.create({
      name: 'Suresh More (BMC Drainage Div)',
      email: 'bmc.supervisor@mumbai.gov.in',
      password: 'password123',
      role: 'worker'
    });

    console.log('[Seeder] Created demo users (Citizens & BMC Workers).');

    // Sample Grievances with GeoJSON [longitude, latitude] in Mumbai
    const sampleGrievances = [
      {
        title: 'Deep crater pothole outside Andheri East Metro Station',
        category: 'pothole',
        description: 'Vehicles getting damaged and heavy traffic congestion during peak hours. Water stagnation is worsening the cavity.',
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        status: 'PENDING',
        location: {
          type: 'Point',
          coordinates: [72.8561, 19.1197] // [lng, lat] Andheri
        },
        reportedBy: citizen1._id
      },
      {
        title: 'High-pressure water pipeline burst on SV Road Bandra',
        category: 'burst_pipe',
        description: 'Continuous clean drinking water gushing onto the road since 6 AM. Road getting inundated.',
        photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
        status: 'IN_PROGRESS',
        location: {
          type: 'Point',
          coordinates: [72.8362, 19.0596] // [lng, lat] Bandra West
        },
        reportedBy: citizen2._id,
        assignedWorker: worker1._id
      },
      {
        title: 'Dangerous hanging live wires near Shivaji Park Dadar',
        category: 'hanging_wire',
        description: 'Overhead electrical wires snapped and dangling dangerously near pedestrian crossing. Immediate insulation required.',
        photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        status: 'PENDING',
        location: {
          type: 'Point',
          coordinates: [72.8397, 19.0269] // [lng, lat] Dadar
        },
        reportedBy: citizen1._id
      },
      {
        title: 'Overflowing municipal garbage container near Kurla station',
        category: 'garbage',
        description: 'Trash has not been cleared for 3 days. Severe odor and stray animal menace.',
        photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
        status: 'RESOLVED',
        location: {
          type: 'Point',
          coordinates: [72.8797, 19.0657] // [lng, lat] Kurla
        },
        reportedBy: citizen2._id,
        assignedWorker: worker2._id
      },
      {
        title: 'Broken stormwater drain cover near Colaba Causeway',
        category: 'other',
        description: 'Concrete slab missing from open drain. Major accident hazard for night pedestrians.',
        photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
        status: 'PENDING',
        location: {
          type: 'Point',
          coordinates: [72.8258, 18.9150] // [lng, lat] Colaba
        },
        reportedBy: citizen1._id
      },
      {
        title: 'Multiple road potholes on Link Road Borivali West',
        category: 'pothole',
        description: 'Patchwork needed immediately before monsoon. Two two-wheelers skidded this morning.',
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        status: 'IN_PROGRESS',
        location: {
          type: 'Point',
          coordinates: [72.8464, 19.2307] // [lng, lat] Borivali
        },
        reportedBy: citizen2._id,
        assignedWorker: worker1._id
      }
    ];

    await Grievance.insertMany(sampleGrievances);
    console.log(`[Seeder] Successfully seeded ${sampleGrievances.length} sample grievances across Mumbai!`);
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Citizen: citizen.rahul@example.com / password123');
    console.log('BMC Worker: bmc.worker@mumbai.gov.in / password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();

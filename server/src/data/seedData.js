import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

export async function getInitialSeedData() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const users = [
    {
      _id: 'USR-001',
      name: 'Dr. Sarah Chen',
      email: 'admin@labledger.com',
      password: hashedPassword,
      role: 'Admin', // Lab owner / PI
      department: 'Principal Investigator & Lab Director',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      _id: 'USR-002',
      name: 'Dr. Anita Rao',
      email: 'researcher@labledger.com',
      password: hashedPassword,
      role: 'Researcher', // Scientist running studies
      department: 'Molecular Biology & Genetics',
      createdAt: '2026-01-12T09:30:00Z'
    },
    {
      _id: 'USR-003',
      name: 'Ravi Patel',
      email: 'tech@labledger.com',
      password: hashedPassword,
      role: 'Technician', // Lab staff handling day-to-day work
      department: 'Specimen Processing & Biobank Ops',
      createdAt: '2026-01-15T11:00:00Z'
    },
    {
      _id: 'USR-004',
      name: 'Dr. Marcus Vance',
      email: 'auditor@labledger.com',
      password: hashedPassword,
      role: 'Viewer', // Supervisor, reviewer, external auditor
      department: 'Quality Assurance & Regulatory Compliance',
      createdAt: '2026-01-18T14:15:00Z'
    }
  ];

  // Storage Hierarchy: Room -> Freezer -> Shelf -> Rack -> Box
  const storageNodes = [
    // Rooms
    {
      _id: 'ROOM-104',
      name: 'Main Bio-Repository 104',
      type: 'room',
      parentId: null,
      temperature: '20°C',
      notes: 'Central cryogenic sample banking facility',
      path: 'Main Bio-Repository 104'
    },
    {
      _id: 'ROOM-202',
      name: 'Genomics Clean Suite 202',
      type: 'room',
      parentId: null,
      temperature: '19°C',
      notes: 'ISO Class 6 molecular biology cleanroom',
      path: 'Genomics Clean Suite 202'
    },

    // Freezers
    {
      _id: 'FRZ-01',
      name: 'Ultra-Low Cryo Freezer (-80°C #1)',
      type: 'freezer',
      parentId: 'ROOM-104',
      temperature: '-80°C',
      notes: 'Thermo Scientific TSX Series, Primary Bio-specimens',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1)'
    },
    {
      _id: 'FRZ-02',
      name: 'Ultra-Low Backup Freezer (-80°C #2)',
      type: 'freezer',
      parentId: 'ROOM-104',
      temperature: '-80°C',
      notes: 'Secondary backup biobank freezer',
      path: 'Main Bio-Repository 104 > Ultra-Low Backup Freezer (-80°C #2)'
    },
    {
      _id: 'FRZ-03',
      name: 'Enzyme & Reagent Freezer (-20°C)',
      type: 'freezer',
      parentId: 'ROOM-202',
      temperature: '-20°C',
      notes: 'Stores DNA extracts, primers, and enzymes',
      path: 'Genomics Clean Suite 202 > Enzyme & Reagent Freezer (-20°C)'
    },

    // Shelves
    {
      _id: 'SHLF-01',
      name: 'Shelf 1 (Upper)',
      type: 'shelf',
      parentId: 'FRZ-01',
      temperature: '-80°C',
      notes: 'Designated for clinical trial blood and serum samples',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 1 (Upper)'
    },
    {
      _id: 'SHLF-02',
      name: 'Shelf 2 (Mid)',
      type: 'shelf',
      parentId: 'FRZ-01',
      temperature: '-80°C',
      notes: 'Designated for RNA isolates and cell cultures',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 2 (Mid)'
    },
    {
      _id: 'SHLF-03',
      name: 'Shelf 1 (Enzymes)',
      type: 'shelf',
      parentId: 'FRZ-03',
      temperature: '-20°C',
      notes: 'Polymerases and master mixes',
      path: 'Genomics Clean Suite 202 > Enzyme & Reagent Freezer (-20°C) > Shelf 1 (Enzymes)'
    },

    // Racks
    {
      _id: 'RCK-01',
      name: 'Rack Alpha (Stainless 4x4)',
      type: 'rack',
      parentId: 'SHLF-01',
      temperature: '-80°C',
      notes: 'Holds 16 cryo boxes',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 1 (Upper) > Rack Alpha'
    },
    {
      _id: 'RCK-02',
      name: 'Rack Beta (Stainless 4x4)',
      type: 'rack',
      parentId: 'SHLF-02',
      temperature: '-80°C',
      notes: 'Holds 16 cryo boxes',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 2 (Mid) > Rack Beta'
    },
    {
      _id: 'RCK-03',
      name: 'Rack Gamma',
      type: 'rack',
      parentId: 'SHLF-03',
      temperature: '-20°C',
      notes: 'Holds reagent microcentrifuge boxes',
      path: 'Genomics Clean Suite 202 > Enzyme & Reagent Freezer (-20°C) > Shelf 1 (Enzymes) > Rack Gamma'
    },

    // Boxes (Grid containers)
    {
      _id: 'BOX-01',
      name: 'CryoBox Red #1 (9x9)',
      type: 'box',
      parentId: 'RCK-01',
      temperature: '-80°C',
      capacity: 81,
      gridRows: 9, // A to I
      gridCols: 9, // 1 to 9
      notes: 'Polycarbonate red cryobox for blood and nucleic acid extracts',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 1 (Upper) > Rack Alpha > CryoBox Red #1 (9x9)'
    },
    {
      _id: 'BOX-02',
      name: 'CryoBox Blue #2 (9x9)',
      type: 'box',
      parentId: 'RCK-02',
      temperature: '-80°C',
      capacity: 81,
      gridRows: 9,
      gridCols: 9,
      notes: 'Cryopreserved cell lines and tissue biopsy cores',
      path: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 2 (Mid) > Rack Beta > CryoBox Blue #2 (9x9)'
    },
    {
      _id: 'BOX-03',
      name: 'PCR Reagents Box #3 (8x12)',
      type: 'box',
      parentId: 'RCK-03',
      temperature: '-20°C',
      capacity: 96,
      gridRows: 8, // A to H
      gridCols: 12, // 1 to 12
      notes: '96-position tube rack for active enzymes and primers',
      path: 'Genomics Clean Suite 202 > Enzyme & Reagent Freezer (-20°C) > Shelf 1 (Enzymes) > Rack Gamma > PCR Reagents Box #3 (8x12)'
    }
  ];

  // Helper to generate QR data URL
  const genQr = async (text) => {
    try {
      return await QRCode.toDataURL(text, { width: 300, margin: 2 });
    } catch {
      return '';
    }
  };

  const samples = [
    {
      _id: 'SMP-0001',
      sampleId: 'LAB-2026-0001',
      name: 'Whole Blood EDTA (Cohort A)',
      type: 'Blood',
      quantity: 10.5,
      unit: 'ml',
      concentration: 'Normal hematocrit (45%)',
      donorId: 'DONOR-8891',
      temperatureReq: '-80°C',
      storageLocation: {
        roomId: 'ROOM-104',
        freezerId: 'FRZ-01',
        shelfId: 'SHLF-01',
        rackId: 'RCK-01',
        boxId: 'BOX-01',
        position: 'A1'
      },
      storagePath: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 1 > Rack Alpha > CryoBox Red #1 > Position A1',
      status: 'Stored',
      notes: 'Collected under IRB Protocol #2025-089. Fasting donor.',
      expiryDate: '2026-11-15T09:00:00.000Z', // Expired
      registeredBy: 'Dr. Anita Rao',
      registeredRole: 'Researcher',
      qrCodeData: await genQr('LAB-2026-0001: Whole Blood EDTA (Position A1)'),
      createdAt: '2026-02-01T10:15:00Z',
      updatedAt: '2026-02-01T10:15:00Z'
    },
    {
      _id: 'SMP-0002',
      sampleId: 'LAB-2026-0002',
      name: 'Purified Genomic DNA (Colorectal)',
      type: 'DNA',
      quantity: 75,
      unit: 'µl',
      concentration: '142.6 ng/µl (A260/280: 1.88)',
      donorId: 'TISSUE-901',
      temperatureReq: '-20°C',
      storageLocation: {
        roomId: 'ROOM-104',
        freezerId: 'FRZ-01',
        shelfId: 'SHLF-01',
        rackId: 'RCK-01',
        boxId: 'BOX-01',
        position: 'A2'
      },
      storagePath: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 1 > Rack Alpha > CryoBox Red #1 > Position A2',
      status: 'Stored',
      notes: 'Extracted using silica-membrane spin columns. High purity.',
      expiryDate: '2027-04-15T00:00:00.000Z',
      registeredBy: 'Dr. Anita Rao',
      registeredRole: 'Researcher',
      qrCodeData: await genQr('LAB-2026-0002: Purified Genomic DNA (Position A2)'),
      createdAt: '2026-02-03T11:45:00Z',
      updatedAt: '2026-02-03T11:45:00Z'
    },
    {
      _id: 'SMP-0003',
      sampleId: 'LAB-2026-0003',
      name: 'Total Cellular RNA Isolate',
      type: 'RNA',
      quantity: 40,
      unit: 'µl',
      concentration: '88.2 ng/µl (RIN 9.4)',
      donorId: 'CELL-441',
      temperatureReq: '-80°C',
      storageLocation: {
        roomId: 'ROOM-104',
        freezerId: 'FRZ-01',
        shelfId: 'SHLF-01',
        rackId: 'RCK-01',
        boxId: 'BOX-01',
        position: 'A3'
      },
      storagePath: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 1 > Rack Alpha > CryoBox Red #1 > Position A3',
      status: 'Stored',
      notes: 'RNase-free water solution. Keep on dry ice during processing.',
      expiryDate: '2026-11-25T11:00:00.000Z', // 2 days left
      registeredBy: 'Dr. Anita Rao',
      registeredRole: 'Researcher',
      qrCodeData: await genQr('LAB-2026-0003: Total Cellular RNA Isolate (Position A3)'),
      createdAt: '2026-02-05T09:10:00Z',
      updatedAt: '2026-02-05T09:10:00Z'
    },
    {
      _id: 'SMP-0004',
      sampleId: 'LAB-2026-0004',
      name: 'Human Serum Albumin Reference',
      type: 'Serum',
      quantity: 5.0,
      unit: 'ml',
      concentration: '40 mg/ml',
      donorId: 'POOL-SERUM-03',
      temperatureReq: '-80°C',
      storageLocation: {
        roomId: 'ROOM-104',
        freezerId: 'FRZ-01',
        shelfId: 'SHLF-02',
        rackId: 'RCK-02',
        boxId: 'BOX-02',
        position: 'B1'
      },
      storagePath: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 2 > Rack Beta > CryoBox Blue #2 > Position B1',
      status: 'Stored',
      notes: 'Calibrated standard for ELISA microplate assays.',
      expiryDate: '2026-11-27T14:00:00.000Z', // 4 days left
      registeredBy: 'Ravi Patel',
      registeredRole: 'Technician',
      qrCodeData: await genQr('LAB-2026-0004: Human Serum Albumin Reference (Position B1)'),
      createdAt: '2026-02-08T14:20:00Z',
      updatedAt: '2026-02-08T14:20:00Z'
    },
    {
      _id: 'SMP-0005',
      sampleId: 'LAB-2026-0005',
      name: 'High-Fidelity Taq Polymerase 5U/µl',
      type: 'Enzyme',
      quantity: 350,
      unit: 'µl',
      concentration: '5.0 U/µl',
      donorId: 'LOT-TAQ-8820',
      temperatureReq: '-20°C',
      storageLocation: {
        roomId: 'ROOM-202',
        freezerId: 'FRZ-03',
        shelfId: 'SHLF-03',
        rackId: 'RCK-03',
        boxId: 'BOX-03',
        position: 'A1'
      },
      storagePath: 'Genomics Clean Suite 202 > Enzyme & Reagent Freezer (-20°C) > Shelf 1 > Rack Gamma > PCR Reagents Box #3 > Position A1',
      status: 'Stored',
      notes: '50% glycerol storage buffer. Do not freeze-thaw repeatedly.',
      expiryDate: '2026-11-30T18:00:00.000Z', // 7 days left (expires on 30 Nov)
      registeredBy: 'Ravi Patel',
      registeredRole: 'Technician',
      qrCodeData: await genQr('LAB-2026-0005: High-Fidelity Taq Polymerase (Position A1)'),
      createdAt: '2026-02-09T16:00:00Z',
      updatedAt: '2026-02-10T11:22:00Z'
    },
    {
      _id: 'SMP-0006',
      sampleId: 'LAB-2026-0006',
      name: 'Cryopreserved Hepatocyte Culture Vials',
      type: 'Cell Culture',
      quantity: 4,
      unit: 'vials',
      concentration: '2.5 x 10^6 viable cells/ml',
      donorId: 'HEP-LINE-3B',
      temperatureReq: '-80°C',
      storageLocation: {
        roomId: 'ROOM-104',
        freezerId: 'FRZ-01',
        shelfId: 'SHLF-02',
        rackId: 'RCK-02',
        boxId: 'BOX-02',
        position: 'C4'
      },
      storagePath: 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1) > Shelf 2 > Rack Beta > CryoBox Blue #2 > Position C4',
      status: 'Stored',
      notes: 'Passage 4. Thaw at 37°C water bath for exactly 90 seconds.',
      expiryDate: '2027-08-01T00:00:00.000Z',
      registeredBy: 'Dr. Sarah Chen',
      registeredRole: 'Admin',
      qrCodeData: await genQr('LAB-2026-0006: Cryopreserved Hepatocyte Culture (Position C4)'),
      createdAt: '2026-02-11T12:00:00Z',
      updatedAt: '2026-02-11T12:00:00Z'
    }
  ];

  // Transfer Logs (Chain of custody matching PDF requirements)
  const transfers = [
    {
      _id: 'TRF-001',
      sampleId: 'LAB-2026-0001',
      sampleName: 'Whole Blood EDTA (Cohort A)',
      sourceLocation: 'Freezer 1 (Shelf 1 > Rack Alpha > Box 1)',
      targetLocation: 'Freezer 2 (Backup Cryo > Shelf 3 > Rack Beta)',
      movedBy: 'Dr. Anita Rao',
      movedRole: 'Researcher',
      custodian: 'Dr. Anita Rao',
      reason: 'experiment - aliquot division and cold-chain backup',
      date: '2026-02-05T14:30:00Z',
      status: 'Completed',
      approvedBy: 'Dr. Sarah Chen'
    },
    {
      _id: 'TRF-002',
      sampleId: 'LAB-2026-0004',
      sampleName: 'Human Serum Albumin Reference',
      sourceLocation: 'Freezer 1 (Shelf 2 > Rack Beta > Box 2)',
      targetLocation: 'Room 202 Incubator Benchtop',
      movedBy: 'Ravi Patel',
      movedRole: 'Technician',
      custodian: 'Ravi Patel',
      reason: 'Annual calibration of ELISA spectrophotometer',
      date: '2026-02-08T15:10:00Z',
      status: 'Completed',
      approvedBy: 'Dr. Sarah Chen'
    }
  ];

  // Experiment Notes (linked to samples used, matching PDF requirements)
  const experiments = [
    {
      _id: 'EXP-001',
      title: 'Targeted PCR Amplification for Exon 7 Variant',
      protocolName: 'Standard High-Fidelity PCR Assay v3.2',
      author: 'Dr. Anita Rao',
      authorRole: 'Researcher',
      date: '2026-02-06',
      sampleIds: ['LAB-2026-0001', 'LAB-2026-0002'],
      samplesUsed: [
        { sampleId: 'LAB-2026-0001', name: 'Whole Blood EDTA', amountUsed: '1.0 ml' },
        { sampleId: 'LAB-2026-0002', name: 'Purified Genomic DNA', amountUsed: '5.0 µl' }
      ],
      notes: 'Used samples 0001 and 0002 for PCR test, results attached. 35 cycles amplification at 60°C annealing temperature.',
      results: 'Clear 450 bp band detected on 1.5% agarose gel electrophoresis. Positive confirmation of exon 7 integrity.',
      tags: ['PCR', 'Genomics', 'Electrophoresis'],
      status: 'Completed'
    },
    {
      _id: 'EXP-002',
      title: 'RNA Quality & Integrity Assessment (RIN)',
      protocolName: 'Agilent 2100 Bioanalyzer RNA 6000 Nano Assay',
      author: 'Dr. Anita Rao',
      authorRole: 'Researcher',
      date: '2026-02-09',
      sampleIds: ['LAB-2026-0003'],
      samplesUsed: [
        { sampleId: 'LAB-2026-0003', name: 'Total Cellular RNA Isolate', amountUsed: '1.0 µl' }
      ],
      notes: 'RNA sample denatured at 70°C for 2 min before microfluidic chip loading.',
      results: 'RIN score calculated at 9.4. Sharp 18S and 28S ribosomal RNA peaks observed. Approved for RNA-seq library prep.',
      tags: ['RNA-Seq', 'Bioanalyzer', 'Quality Control'],
      status: 'Completed'
    }
  ];

  // Audit Logs (Immutable history matching PDF requirements)
  const auditLogs = [
    {
      _id: 'AUD-001',
      action: 'UPDATE_SAMPLE',
      performedBy: 'Ravi Patel',
      performedRole: 'Technician',
      entityType: 'Sample',
      entityId: 'LAB-2026-0005',
      details: 'Ravi edited the quantity of sample LAB-2026-0005 on 10 Nov (Adjusted from 500 µl to 350 µl after aliquot distribution)',
      changes: { old: { quantity: 500 }, new: { quantity: 350 } },
      timestamp: '2026-02-10T11:22:00Z',
      ipAddress: '192.168.1.42'
    },
    {
      _id: 'AUD-002',
      action: 'TRANSFER_SAMPLE',
      performedBy: 'Dr. Anita Rao',
      performedRole: 'Researcher',
      entityType: 'Transfer',
      entityId: 'TRF-001',
      details: 'Anita moved sample LAB-2026-0001 from Freezer 1 to Freezer 2 for experiment',
      changes: { from: 'Freezer 1', to: 'Freezer 2' },
      timestamp: '2026-02-05T14:30:00Z',
      ipAddress: '192.168.1.18'
    },
    {
      _id: 'AUD-003',
      action: 'CREATE_NOTE',
      performedBy: 'Dr. Anita Rao',
      performedRole: 'Researcher',
      entityType: 'Experiment',
      entityId: 'EXP-001',
      details: 'Anita logged experiment note: "Used samples 0001 and 0002 for PCR test, results attached"',
      changes: null,
      timestamp: '2026-02-06T16:00:00Z',
      ipAddress: '192.168.1.18'
    },
    {
      _id: 'AUD-004',
      action: 'CREATE_SAMPLE',
      performedBy: 'Dr. Sarah Chen',
      performedRole: 'Admin',
      entityType: 'Sample',
      entityId: 'LAB-2026-0006',
      details: 'Dr. Sarah Chen registered new specimen LAB-2026-0006 (Cell Culture) in Box 02 (Pos C4)',
      changes: null,
      timestamp: '2026-02-11T12:00:00Z',
      ipAddress: '192.168.1.10'
    },
    {
      _id: 'AUD-005',
      action: 'CREATE_SAMPLE',
      performedBy: 'Dr. Anita Rao',
      performedRole: 'Researcher',
      entityType: 'Sample',
      entityId: 'LAB-2026-0001',
      details: 'Dr. Anita Rao registered sample LAB-2026-0001 (Whole Blood EDTA)',
      changes: null,
      timestamp: '2026-02-01T10:15:00Z',
      ipAddress: '192.168.1.18'
    }
  ];

  const settings = {
    idPrefix: 'LAB-',
    idFormat: 'LAB-YYYY-XXXX',
    currentSequence: 1007,
    labName: 'BioLedger Genomics & Specimen Institute',
    piName: 'Dr. Sarah Chen',
    sampleTypes: [
      'Blood', 'Serum', 'Tissue', 'DNA', 'RNA', 'Cell Culture',
      'Enzyme', 'Plasma', 'Saliva', 'Urine', 'Proteins', 'Biopsy Core'
    ],
    units: ['ml', 'µl', 'mg', 'µg', 'vials', 'aliquots', 'plates']
  };

  return {
    users,
    storageNodes,
    samples,
    transfers,
    experiments,
    auditLogs,
    settings
  };
}

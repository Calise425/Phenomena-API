exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('reports', {
      id: { type: 'serial', primaryKey: true },
      title: { type: 'varchar(255)', notNull: true },
      location: { type: 'varchar(255)', notNull: true },
      description: { type: 'text', notNull: true },
      password: { type: 'varchar(255)', notNull: true },
      isOpen: { type: 'boolean', default: true },
      expirationDate: { type: 'timestamptz', default: pgm.func("current_timestamp + interval '1 day'") }
  });
  pgm.createTable('comments', {
      id: { type: 'serial', primaryKey: true },
      reportId: { type: 'integer', references: 'reports(id)' },
      content: { type: 'text', notNull: true }
  });
};

exports.down = pgm => {
  pgm.dropTable('comments');
  pgm.dropTable('reports');
};
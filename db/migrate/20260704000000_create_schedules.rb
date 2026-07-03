class CreateSchedules < ActiveRecord::Migration[8.0]
  def change
    create_table :schedules do |t|
      t.integer :day_of_week, null: false
      t.time    :start_time,  null: false
      t.time    :end_time,    null: false
      t.string  :action,      null: false, default: "dim"
      t.integer :dim_level,   null: false, default: 80
      t.boolean :enabled,     null: false, default: true

      t.timestamps
    end

    add_index :schedules, [ :day_of_week, :enabled ]
  end
end

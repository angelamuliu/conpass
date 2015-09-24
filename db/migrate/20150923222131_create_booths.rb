class CreateBooths < ActiveRecord::Migration
  def change
    create_table :booths do |t|
      t.datetime :start_time
      t.datetime :end_time
      t.integer :vendor_id
      t.integer :x_pos
      t.integer :y_pos
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end

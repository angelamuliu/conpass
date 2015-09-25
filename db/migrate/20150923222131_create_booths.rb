class CreateBooths < ActiveRecord::Migration
  def change
    create_table :booths do |t|
      t.integer :x_pos
      t.integer :y_pos
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end

class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
        t.integer :layer
        t.integer :x_pos
        t.integer :y_pos
        t.integer :cast_id
        t.integer :map_id
    end
  end
end

class AddConventionToAssociate < ActiveRecord::Migration
  def change
    add_column :associates, :convention_id, :integer
  end
end

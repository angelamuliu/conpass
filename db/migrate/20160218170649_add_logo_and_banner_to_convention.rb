class AddLogoAndBannerToConvention < ActiveRecord::Migration
  def change
    add_column :conventions, :logo, :string
    add_column :conventions, :banner, :string
  end
end

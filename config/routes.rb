Rails.application.routes.draw do

  resources :vendor_booths

  # Static pages
  get 'home' => 'home#index', :as => :home
  get 'about' => 'home#about', :as => :about
  get 'faq' => 'home#faq', :as => :faq

  #Root url
  root :to => 'home#index'

  resources :vendor_tags

  resources :tags

  resources :booths

  resources :vendors

  resources :maps do
    get 'craft', :on => :member # Main map crafting drag and drop screen
    post 'save', :on => :member # Saving map and related from the craft screen
  end

  resources :conventions

end

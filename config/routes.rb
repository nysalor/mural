Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  get "images/:filename", to: "images#show", filename: /.+/

  get "admin",  to: redirect("/admin/")
  get "clock",  to: redirect("/clock/")

  namespace :api do
    get  "images/next",     to: "images#next"
    get  "config",          to: "config#show"
    get  "schedule/status", to: "schedules#status"
    resources :schedules, only: [:index, :create, :update, :destroy]
  end
end

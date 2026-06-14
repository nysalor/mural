class ApplicationController < ActionController::API
  private

  def mural_config
    Rails.env.development? ? Rails.application.config_for(:mural) : Rails.configuration.mural
  end
end

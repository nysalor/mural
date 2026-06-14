module Api
  class ImagesController < ApplicationController
    def next
      directory = mural_config.dig(:images, :directory)
      mode      = mural_config.dig(:images, :mode)
      image_url = ImageSequencer.pick(directory, mode)

      if image_url
        render json: { url: image_url }
      else
        render json: { error: "No images found in #{directory}" }, status: :not_found
      end
    end
  end
end

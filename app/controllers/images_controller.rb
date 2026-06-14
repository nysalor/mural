class ImagesController < ApplicationController
  def show
    directory = Rails.configuration.mural.dig(:images, :directory)
    filename  = params[:filename]
    path      = File.join(directory, filename)

    if File.exist?(path) && File.file?(path)
      send_file path, disposition: :inline
    else
      head :not_found
    end
  end
end

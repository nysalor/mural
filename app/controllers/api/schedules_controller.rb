module Api
  class SchedulesController < ApplicationController
    def index
      render json: Schedule.order(:day_of_week, :start_time)
    end

    def create
      schedule = Schedule.new(schedule_params)
      if schedule.save
        render json: schedule, status: :created
      else
        render json: { errors: schedule.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      schedule = Schedule.find(params[:id])
      if schedule.update(schedule_params)
        render json: schedule
      else
        render json: { errors: schedule.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      Schedule.find(params[:id]).destroy
      head :no_content
    end

    def status
      render json: Schedule.current_status
    end

    private

    def schedule_params
      params.require(:schedule).permit(:day_of_week, :start_time, :end_time, :action, :dim_level, :enabled)
    end
  end
end

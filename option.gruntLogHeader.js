module.exports = function(grunt)
{
	// This plugin should only run once -- avoid issues with multiple require()'s
	if (!grunt.task.runTaskFn_old)
	{
		/*
			Copied from https://github.com/gruntjs/grunt/blob/v0.4.3/lib/grunt/task.js#L65-L72
		*/
		function getOptions(name)
		{
			var args = [{}]./*concat(grunt.util.toArray(arguments)).*/concat([
				grunt.config([name, "options"])
			]);
			
			options = grunt.util._.extend.apply(null, args);
			
			return options;
		}
		
		
		
		/*
			Copied from https://github.com/gruntjs/grunt/blob/v0.4.3/lib/grunt/task.js#L241-L250
		*/
		function getTargetOptions(name, target)
		{
			var targetObj = grunt.config([name, target]);
			
			var args = [{}]./*concat(grunt.util.toArray(arguments)).*/concat([
				grunt.config([name, "options"]),
				grunt.util.kindOf(targetObj) === "object" ? targetObj.options : {}
			]);
			
			var options = grunt.util._.extend.apply(null, args);
			
			return options;
		}
		
		
		
		function hideTaskHeader()
		{
			// Paranoid check
			if (!grunt.log.header_old)
			{
				grunt.log.header_old = grunt.log.header;
				grunt.log.header = function(){}
			}
			
			
		}
		
		
		
		function unhideTaskHeader()
		{
			if (grunt.log.header_old)
			{
				grunt.log.header = grunt.log.header_old;
				grunt.log.header_old = null;
			}
		}
		
		
		
		grunt.task.runTaskFn_old = grunt.task.runTaskFn;
		grunt.task.runTaskFn = function(context, fn, done)
		{
			var done_old = done;
			done = function()
			{
				// Reset for next task
				unhideTaskHeader();
				
				// Find next task options
				grunt.task._queue.every( function(queuedTask)
				{
					// If not an already completed task
					//if ( !queuedTask.hasOwnProperty("placeholder") )
					if (queuedTask.task)
					{
						// If single-task or target of multi-task (not an alias)
						//if ( !grunt.task.isTaskAlias(queuedTask.task.name) )	// grunt issue#1089
						if (!queuedTask.task.multi || queuedTask.task.multi && queuedTask.args.length)
						{
							if (queuedTask.args.length)
							{
								var options = getTargetOptions( queuedTask.task.name, queuedTask.args[0] );
							}
							else
							{
								var options = getOptions( queuedTask.task.name );
							}
							
							if (options.gruntLogHeader === false)
							{
								hideTaskHeader();
							}
						}
						
						// Either found next task data
						// or doesn't know what next task is until alias is processedd
						return false;
					}
					
					return true;
				});
				
				done_old.apply(this, arguments);
			}
			
			grunt.task.runTaskFn_old.apply(this, arguments);
		}
	}
}

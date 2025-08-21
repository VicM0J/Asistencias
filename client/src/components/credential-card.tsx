import type { Employee } from "@shared/schema";

interface CredentialCardProps {
  employee: Employee;
  className?: string;
}

export function CredentialCard({ employee, className = "" }: CredentialCardProps) {
  return (
    <div className={`mx-auto ${className}`} style={{ width: '340px', height: '216px' }}>
      <div 
        className="bg-white border border-gray-300 rounded-lg p-4 h-full relative shadow-lg"
        style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
      >
        {/* Header with logo and ID */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-jasana-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-jasana-blue">JASANA</h4>
              <p className="text-xs text-gray-500 uppercase tracking-wider">UNIFORME CORPORATIVO</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">ID : {employee.id}</p>
            <div className="border-b-2 border-gray-800 w-16 mt-1"></div>
          </div>
        </div>

        {/* Employee Info and Photo */}
        <div className="flex items-start space-x-4 mb-6">
          {employee.photoUrl ? (
            <img 
              src={employee.photoUrl} 
              alt={employee.name}
              className="w-24 h-28 rounded-lg object-cover bg-gray-200"
              style={{ borderRadius: '12px' }}
            />
          ) : (
            <div className="w-24 h-28 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs">Sin foto</span>
            </div>
          )}
          <div className="flex-1 pt-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
              {employee.name.toUpperCase()}
            </h3>
            <p className="text-sm text-gray-700 font-semibold">
              <span className="font-bold">ÁREA:</span> {employee.area.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Barcode */}
        <div className="absolute bottom-3 left-4 right-4">
          <div 
            className="h-12 bg-black flex items-end justify-center"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, black 0px, black 3px, white 3px, white 6px)',
              borderRadius: '2px'
            }}
          />
          <div className="text-center mt-1">
            <span className="text-xs font-mono font-bold text-gray-800">{employee.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
